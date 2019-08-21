"""Writes results and parameters to files."""
import json
import os
import torch


def init_results(results):
  """Init the results variable to be able to hold all iterations.

  Args:
    results: The variable to be initialized.
  """
  results["iterations"] = []


def write_results(base_path, results, params, experiment_type):
  """Write the results to a file.

  Args:
    base_path: Path where the results get written, has to exist to work.
    results: The results of this run.
    params: The parameters for this run.
    experiment_type: The type of experiment that has been conducted.
  """
  results_path = os.path.join(base_path, "results.json")
  results_file = open(results_path, "w")
  output = {
      "params": params,
      "results": results,
      "type": experiment_type
  }
  json.dump(output, results_file)
  results_file.close()


def get_metrics(tokens, iteration, temperature, max_values, results, loss=None,
                ids_loss=None, activation=None, ids_activation=None,
                emb_tokens=None, emb_activation=0.0, emb_ana=0, iterations=0):
  """Return the results of the current iteration.

  Args:
    tokens: The tokens that currently have the highest one-hot value.
    iteration: The current iteration number.
    temperature: The current softmax temperature for the one-hot encoding.
    max_values: Current value of the maximum token value per token.
    results: The file where all this gets written.
    loss: The MSE between the current embedding and the target.
    ids_loss: The MSE between the tokens embedding and the target.
    activation: The activation of the current iteration.
    ids_activation: The snapped to tokens activation for the current iteration.
    emb_tokens: Optional embedding tokens for closest embedding results.
    emb_activation: Optional activation value for closest embedding.
    emb_ana: Optional embedding analysis frequency.
    iterations: Number of total iterations in this run.
  """
  iteration = {
      "number": iteration,
      "tokens": tokens,
      "temperature": temperature.item(),
      "max_values": max_values[0].tolist()
  }
  if loss is not None:
    iteration["loss"] = loss.item()
  if ids_loss is not None:
    iteration["ids_loss"] = ids_loss.item()
  if activation is not None:
    iteration["activation"] = activation.item()
  if ids_activation is not None:
    iteration["ids_activation"] = ids_activation.item()
  if emb_ana != 0:
    if (iteration == iterations) or (iteration % emb_ana == 0):
      iteration["emb_tokens"] = str(emb_tokens)
      iteration["emb_activation"] = emb_activation.item()
  results["iterations"].append(iteration)


def get_params(params, args, tokens, embedding_ana=0):
  """Get the params formatted of the current run.

  Args:
    params: Variable where the parameters are stored.
    args: The arguments to write to the params file.
    tokens: The tokens of the input sentence.
    embedding_ana: Optional embedding analysis frequency parameter.
  """
  params["layer_id"] = args.layer_id
  params["word_id"] = args.word_id
  params["neuron_id"] = args.neuron_id
  params["dream_start"] = args.dream_start
  params["dream_end"] = args.dream_end
  params["num_iterations"] = args.num_iterations
  params["gumbel"] = args.gumbel
  params["warmup"] = args.warmup
  params["start_temp"] = args.start_temp
  params["end_temp"] = args.end_temp
  params["anneal"] = args.anneal
  params["learning_rate"] = args.learning_rate
  params["sentence"] = args.sentence
  params["tokens"] = tokens
  params["model_config"] = args.model_config
  params["metrics_frequency"] = args.metrics_frequency
  if args.__contains__("normalize"):
    params["normalize"] = args.normalize
  if args.__contains__("shift_vector"):
    params["shift_vector"] = args.shift_vector
  if args.__contains__("shift_start"):
    params["shift_start"] = args.shift_start
  if args.__contains__("shift_end"):
    params["shift_end"] = args.shift_end
  if args.__contains__("shift_magnitude"):
    params["shift_magnitude"] = args.shift_magnitude
  if args.__contains__("target"):
    params["target"] = args.target
  if embedding_ana != 0:
    params["emb_ana"] = embedding_ana


def write_top_ks(base_path, data, dream_start, params):
  """Write the top_k results to a file.

  Args:
    base_path: Path where the results get written, has to exist to work.
    data: The results of the top_k analysis of this run.
    dream_start: The start index of the dreaming process.
    params: The parameters of this run.
  """
  for i in range(len(data)):
    data[i]["word_id"] = dream_start + i
    data[i]["params"] = params
    data[i]["type"] = "top_words"
    top_k_path = os.path.join(base_path,
                              "top_k" + str(i + dream_start) + ".json")
    top_k_file = open(top_k_path, "w")
    json.dump(data[i], top_k_file)
    top_k_file.close()


def get_top_ks(one_hots_sm, k, iteration, data, modify_start, modify_end,
               tokenizer, activation=None):
  """Writes the top scores for one word into the data variable.

  Args:
    one_hots_sm: Softmaxed one hot vector of tokens.
    k: Number of top tokens to output.
    iteration: The current iteration number of the process.
    data: The data object that holds the top values.
    modify_start: The start index of modifyable content.
    modify_end: The end index of modifyable content.
    tokenizer: Used to convert between ids and tokens.
    activation: Optionally also write the activation to the file.
  """
  for i in range(modify_end - modify_start + 1):
    if iteration == 0:
      data.append({})
      data[i]["iterations"] = []
    scores, indices = torch.topk(one_hots_sm[0][modify_start + i], k, -1)
    ind_np = indices.data.cpu().numpy()
    tokens = tokenizer.convert_ids_to_tokens(ind_np)
    scores_np = scores.data.cpu().numpy()
    data[i]["iterations"].append({
        "number": iteration,
        "indices": ind_np.tolist(),
        "tokens": tokens,
        "scores": scores_np.tolist()
    })
    if activation is not None:
      last_iter = len(data[i]["iterations"]) - 1
      data[i]["iterations"][last_iter]["activation"] = activation.item()


def get_params_mlm(params, args, tokens):
  """Get the params formatted of the current run.

  Args:
    params: Variable where the parameters are stored.
    args: The arguments to write to the params file.
    tokens: The tokens of the input sentence.
  """
  params["maximize_word"] = args.maximize_word
  params["maximize_id"] = args.maximize_id
  params["dream_before_start"] = args.dream_before_start
  params["dream_before_end"] = args.dream_before_end
  params["dream_after_start"] = args.dream_after_start
  params["dream_after_end"] = args.dream_after_end
  params["num_iterations"] = args.num_iterations
  params["gumbel"] = args.gumbel
  params["warmup"] = args.warmup
  params["start_temp"] = args.start_temp
  params["end_temp"] = args.end_temp
  params["anneal"] = args.anneal
  params["learning_rate"] = args.learning_rate
  params["sentence"] = args.sentence
  params["tokens"] = tokens
  params["model_config"] = args.model_config
  params["metrics_frequency"] = args.metrics_frequency
  params["normalize"] = args.normalize


def get_metrics_mlm(tokens, prediction, ids_prediction, iteration, temperature,
                    max_values, results):
  """Get the metrics of the current iteration for masked language model dream.

  Args:
    tokens: The current tokens the model has optimized to.
    prediction: The current prediction score from the embeddings in use.
    ids_prediction: The current prediction score using the top tokens.
    iteration: The current iteration of the optimization process.
    temperature: The current softmax temperature for the optimization.
    max_values: The current value of certainity for each token.
    results: The file where all this gets written.
  """
  iteration = {
      "number": iteration,
      "tokens": tokens,
      "temperature": temperature.item(),
      "max_values": max_values[0].tolist()
  }
  iteration["prediction"] = prediction.item()
  iteration["ids_prediction"] = ids_prediction.item()
  results["iterations"].append(iteration)


def write_top_ks_mlm(predictions, iteration, top_k_file, k, tokenizer,
                     maximize_word, normalize):
  """Write the top predictions of the current iteration to a file.

  Args:
    predictions: The prediction scores of the last inference run.
    iteration: The current iteration number.
    top_k_file: The file to write the top predictions to.
    k: How many predictions to write for each iteration.
    tokenizer: Used to convert between tokens and ids.
    maximize_word: The word this run is trying to maximize for.
    normalize: If the prediction is to be normalized.
  """
  if normalize:
    sm = torch.nn.functional.softmax(predictions[0][maximize_word], -1)
    scores, indices = torch.topk(sm, k, -1)
  else:
    scores, indices = torch.topk(predictions[0][maximize_word], k, -1)
  ind_np = indices.data.cpu().numpy()
  tokens = tokenizer.convert_ids_to_tokens(ind_np)
  scores_np = scores.data.cpu().numpy()
  top_k_file.write("Iteration: {}".format(iteration))
  top_k_file.write("\n")
  top_k_file.write("Tokens:")
  top_k_file.write("\n")
  top_k_file.write(str(tokens))
  top_k_file.write("\n")
  top_k_file.write("Score:")
  top_k_file.write("\n")
  top_k_file.write(str(scores_np))
  top_k_file.write("\n")
  top_k_file.write("\n")
