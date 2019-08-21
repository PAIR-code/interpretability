# Contains functionality that supports the usage of bert with pytorch.
package(default_visibility = [":user-visible-package"])

package_group(
    name = "user-visible-package",
    packages = [
        "//learning/vis/bert_dream/dream",
        "//learning/vis/bert_dream/linear_classifier",
    ],
)

py_library(
    name = "activation_helper",
    srcs = ["activation_helper.py"],
    srcs_version = "PY2AND3",
    deps = [
        ":inference_helper",
        ":one_hots_helper",
        "//third_party/py/torch:pytorch",
    ],
)

py_library(
    name = "attention_mask_helper",
    srcs = ["attention_mask_helper.py"],
    srcs_version = "PY2AND3",
    deps = [
        "//third_party/py/torch:pytorch",
    ],
)

py_library(
    name = "classifier_helper",
    srcs = ["classifier_helper.py"],
    srcs_version = "PY2AND3",
    deps = [
        "//pyglib:gfile",
        "//third_party/py/torch:pytorch",
    ],
)

py_library(
    name = "embeddings_config",
    srcs = ["embeddings_config.py"],
    srcs_version = "PY2AND3",
    deps = [
    ],
)

py_library(
    name = "embeddings_helper",
    srcs = ["embeddings_helper.py"],
    srcs_version = "PY2AND3",
    deps = [
        ":activation_helper",
        ":embeddings_config",
        "//third_party/py/numpy",
        "//third_party/py/torch:pytorch",
    ],
)

py_library(
    name = "folder_helper",
    srcs = ["folder_helper.py"],
    srcs_version = "PY2AND3",
    deps = [
        "//pyglib:gfile",
    ],
)

py_library(
    name = "inference_helper",
    srcs = ["inference_helper.py"],
    srcs_version = "PY2AND3",
    deps = [
        "//third_party/py/torch:pytorch",
    ],
)

py_library(
    name = "one_hots_helper",
    srcs = ["one_hots_helper.py"],
    srcs_version = "PY2AND3",
    deps = [
        ":embeddings_config",
        "//third_party/py/torch:pytorch",
    ],
)

py_library(
    name = "output_helper",
    srcs = ["output_helper.py"],
    srcs_version = "PY2AND3",
    deps = [
        "//pyglib:gfile",
        "//third_party/py/torch:pytorch",
    ],
)

py_library(
    name = "optimization_helper",
    srcs = ["optimization_helper.py"],
    srcs_version = "PY2AND3",
    deps = [
        ":activation_helper",
        ":inference_helper",
        ":one_hots_helper",
        ":output_helper",
        ":setup_helper",
        "//third_party/py/torch:pytorch",
    ],
)

py_library(
    name = "setup_helper",
    srcs = ["setup_helper.py"],
    srcs_version = "PY2AND3",
    deps = [
        ":embeddings_helper",
        "//third_party/py/pytorch_pretrained_bert",
        "//third_party/py/torch:pytorch",
    ],
)

py_library(
    name = "tokenization_helper",
    srcs = ["tokenization_helper.py"],
    srcs_version = "PY2AND3",
    deps = [
        "//third_party/py/torch:pytorch",
    ],
)
