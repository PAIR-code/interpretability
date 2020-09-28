class DreamApi {
  static getDreamJSON(id) {
    const identifier = id + "_dream.json";
    return this.fetchData(identifier);
  }

  static getAnnealingJSON(id) {
    const identifier = id + "_annealing.json";
    return this.fetchData(identifier);
  }

  static getTopWordsJSON(id) {
    const identifier = id + "_top_words.json";
    return this.fetchData(identifier);
  }

  static getSimilarWordsJSON(id) {
    const identifier = id + "_similar_words.json";
    return this.fetchData(identifier);
  }

  static getReconstructionJSON(id) {
    const identifier = id + "_reconstruction.json";
    return this.fetchData(identifier);
  }

  static getShiftedReconstructionJSON(id) {
    const identifier = id + "_shifted_reconstruction.json";
    return this.fetchData(identifier);
  }

  static fetchData(identifier) {
    const request = new Request(
      `${process.env.PUBLIC_URL}/data/${identifier}`,
      {
        // Prepare the Request
        method: "GET",
      }
    );

    return fetch(request)
      .then((response) => {
        // Return the result of the Request
        return response.json();
      })
      .catch((error) => {
        return error;
      });
  }
}

export default DreamApi;
