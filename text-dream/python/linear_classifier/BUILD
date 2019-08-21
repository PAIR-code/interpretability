# Used to train a linear classifier for BERT embeddings.
py_binary(
    name = "activations_to_sstable",
    srcs = ["activations_to_sstable.py"],
    python_version = "PY3",
    srcs_version = "PY2AND3",
    deps = [
        "//file/colossus/public:cns",
        "//learning/deepmind/xmanager2/client/google",
        "//learning/vis/bert_dream/helpers:folder_helper",
        "//pyglib:gfile",
        "//sstable/python:pysstable",
        "//third_party/py/absl:app",
        "//third_party/py/absl/flags",
        "//third_party/py/numpy",
    ],
)

py_binary(
    name = "classify_token",
    srcs = ["classify_token.py"],
    python_version = "PY3",
    srcs_version = "PY2AND3",
    deps = [
        "//file/colossus/public:cns",
        "//learning/vis/bert_dream/helpers:activation_helper",
        "//learning/vis/bert_dream/helpers:classifier_helper",
        "//learning/vis/bert_dream/helpers:inference_helper",
        "//learning/vis/bert_dream/helpers:setup_helper",
        "//learning/vis/bert_dream/helpers:tokenization_helper",
        "//pyglib:gfile",
        "//third_party/py/absl:app",
        "//third_party/py/absl/flags",
        "//third_party/py/pytorch_pretrained_bert",
        "//third_party/py/torch:pytorch",
    ],
)

py_binary(
    name = "export_activations_masked",
    srcs = ["export_activations_masked.py"],
    python_version = "PY3",
    srcs_version = "PY2AND3",
    deps = [
        "//file/colossus/public:cns",
        "//learning/deepmind/xmanager2/client/google",
        "//learning/vis/bert_dream/helpers:embeddings_helper",
        "//learning/vis/bert_dream/helpers:folder_helper",
        "//learning/vis/bert_dream/helpers:inference_helper",
        "//learning/vis/bert_dream/helpers:setup_helper",
        "//learning/vis/bert_dream/helpers:tokenization_helper",
        "//pyglib:gfile",
        "//third_party/py/absl:app",
        "//third_party/py/absl/flags",
        "//third_party/py/numpy",
        "//third_party/py/pytorch_pretrained_bert",
        "//third_party/py/torch:pytorch",
    ],
)

py_binary(
    name = "export_token_activation",
    srcs = ["export_token_activation.py"],
    python_version = "PY3",
    srcs_version = "PY2AND3",
    deps = [
        "//file/colossus/public:cns",
        "//learning/deepmind/xmanager2/client/google",
        "//learning/vis/bert_dream/helpers:embeddings_helper",
        "//learning/vis/bert_dream/helpers:folder_helper",
        "//learning/vis/bert_dream/helpers:inference_helper",
        "//learning/vis/bert_dream/helpers:setup_helper",
        "//learning/vis/bert_dream/helpers:tokenization_helper",
        "//pyglib:gfile",
        "//third_party/py/absl:app",
        "//third_party/py/absl/flags",
        "//third_party/py/numpy",
        "//third_party/py/pytorch_pretrained_bert",
        "//third_party/py/torch:pytorch",
    ],
)

py_binary(
    name = "train",
    srcs = ["train.py"],
    python_version = "PY3",
    srcs_version = "PY2AND3",
    deps = [
        "//file/colossus/public:cns",
        "//learning/deepmind/xmanager2/client/google",
        "//learning/vis/bert_dream/helpers:activation_helper",
        "//learning/vis/bert_dream/helpers:folder_helper",
        "//learning/vis/bert_dream/helpers:inference_helper",
        "//learning/vis/bert_dream/helpers:setup_helper",
        "//learning/vis/bert_dream/helpers:tokenization_helper",
        "//pyglib:gfile",
        "//sstable/python:pysstable",
        "//third_party/py/absl:app",
        "//third_party/py/absl/flags",
        "//third_party/py/pytorch_pretrained_bert",
        "//third_party/py/torch:pytorch",
    ],
)
