class DreamApi {
  static getDreamJSON(id) {
    const identifier = id + '_dream.json';
    const request = new Request(`${process.env.PUBLIC_URL}/data/${identifier}`, { // Prepare the Request
      method: 'GET'
    });

    return fetch(request).then(response => { // Return the result of the Request
      return response.json();
    }).catch(error => {
      return error;
    });
    // fetch(`${process.env.PUBLIC_URL}/data/1_dream.json`).then((r) => r.json()).then((data) =>{
    //   console.log(data)
    //   return data;
    // })
  }
}

export default DreamApi;