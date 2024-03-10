##  🩺 Patchscopes: A Unifying Framework for Inspecting Hidden Representations of Language Models


### Overview
We propose a framework that decodes specific information from a representation within an LLM by “patching” it into the inference pass on a different prompt that has been designed to encourage the extraction of that information. A "Patchscope" is a configuration of our framework that can be viewed as an inspection tool geared towards a particular objective.

For example, this figure shows a simple Patchscope for decoding what is encoded in the representation of "CEO" in the source prompt (left). We patch a target prompt (right) comprised of few-shot demonstrations of token repetitions, which encourages decoding the token identity given a hidden representation.

[**[Paper]**](https://arxiv.org/abs/2401.06102) [**[Project Website]**](https://pair-code.github.io/interpretability/patchscopes/)

<p align="left"><img width="60%" src="images/patchscopes.png" /></p>

### 💾 Download textual data
The script is provided [**here**](download_the_pile_text_data.py). Use the following command to run it:
```python
python3 download_the_pile_text_data.py
```

### 🦙 For using Vicuna-13B
Run the following command for using the Vicuna 13b model (see also details [here](https://huggingface.co/CarperAI/stable-vicuna-13b-delta)):
```python
python3 apply_delta.py --base meta-llama/Llama-2-13b-hf --target ./stable-vicuna-13b --delta CarperAI/stable-vicuna-13b-delta
```

### 🧪 Experiments

#### (1) Next Token Prediction
The main code used appears [here](next_token_prediction.ipynb).
#### (2) Attribute Extraction
For this experiment, you should download the `preprocessed_data` directory.
The main code used appears [here](attribute_extraction.ipynb).
#### (3) Entity Processing
The main code used appears [here](entity_processing.ipynb). The dataset is available for downloading [here](https://github.com/AlexTMallen/adaptive-retrieval/blob/main/data/popQA.tsv).
#### (4) Cross-model Patching
The main code used appears [here](patch_cross_model.ipynb).
#### (5) Self-Correction in Multi-Hop Reasoning
For this experiment, you should download the `preprocessed_data` directory.
The main code used appears [here](multihop-CoT.ipynb). The code provided supports the Vicuna-13B model.

### 📙 BibTeX
```bibtex
@misc{ghandeharioun2024patchscopes,
      title={Patchscopes: A Unifying Framework for Inspecting Hidden Representations of Language Models},
      author={Ghandeharioun, Asma and Caciularu, Avi and Pearce, Adam and Dixon, Lucas and Geva, Mor},
      year={2024},
      eprint={2401.06102},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```
