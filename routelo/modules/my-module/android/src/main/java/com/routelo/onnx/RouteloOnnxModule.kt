package com.routelo.onnx

import ai.onnxruntime.NodeInfo
import ai.onnxruntime.OnnxTensor
import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import ai.onnxruntime.TensorInfo
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.nio.FloatBuffer

class RouteloOnnxModule : Module() {
  private val environment: OrtEnvironment by lazy {
    OrtEnvironment.getEnvironment()
  }

  override fun definition() = ModuleDefinition {
    Name("RouteloOnnx")

    Function("isAvailable") {
      true
    }

    AsyncFunction("inspectBundledModel") { assetName: String ->
      createSession(assetName).use { session ->
        mapOf(
          "runtimeVersion" to environment.version,
          "modelAsset" to assetName,
          "inputs" to session.inputInfo.map { (name, info) -> tensorInfo(name, info) },
          "outputs" to session.outputInfo.map { (name, info) -> tensorInfo(name, info) },
        )
      }
    }

    AsyncFunction("runFloatModel") {
        assetName: String,
        inputName: String,
        values: List<Double>,
        shape: List<Int> ->
      val startedAt = System.nanoTime()
      val floatValues = values.map(Double::toFloat).toFloatArray()
      val longShape = shape.map(Int::toLong).toLongArray()

      createSession(assetName).use { session ->
        OnnxTensor.createTensor(
          environment,
          FloatBuffer.wrap(floatValues),
          longShape,
        ).use { inputTensor ->
          session.run(mapOf(inputName to inputTensor)).use { output ->
            val outputName = session.outputNames.first()
            mapOf(
              "outputName" to outputName,
              "values" to flattenNumbers(output[0].value),
              "processingMs" to ((System.nanoTime() - startedAt) / 1_000_000.0),
            )
          }
        }
      }
    }
  }

  private fun createSession(assetName: String): OrtSession {
    val modelBytes = appContext.reactContext
      ?.assets
      ?.open(assetName)
      ?.use { it.readBytes() }
      ?: throw IllegalStateException("React context is unavailable.")
    return environment.createSession(modelBytes)
  }

  private fun tensorInfo(name: String, nodeInfo: NodeInfo): Map<String, Any> {
    val info = nodeInfo.info
    if (info !is TensorInfo) {
      return mapOf(
        "name" to name,
        "type" to info::class.java.simpleName,
        "shape" to emptyList<Long>(),
      )
    }
    return mapOf(
      "name" to name,
      "type" to info.type.toString(),
      "shape" to info.shape.toList(),
    )
  }

  private fun flattenNumbers(value: Any?): List<Double> {
    val result = mutableListOf<Double>()

    fun visit(item: Any?) {
      when (item) {
        null -> Unit
        is Number -> result.add(item.toDouble())
        is FloatArray -> item.forEach { result.add(it.toDouble()) }
        is DoubleArray -> item.forEach { result.add(it) }
        is IntArray -> item.forEach { result.add(it.toDouble()) }
        is LongArray -> item.forEach { result.add(it.toDouble()) }
        is Array<*> -> item.forEach(::visit)
        is Iterable<*> -> item.forEach(::visit)
        else -> throw IllegalArgumentException(
          "Unsupported ONNX output type: ${item::class.java.name}",
        )
      }
    }

    visit(value)
    return result
  }
}
