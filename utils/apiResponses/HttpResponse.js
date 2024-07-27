class HttpResponse {
  /**
   * To send api response
   * @param {*} resp
   * @param {*} data
   * @param {*} status
   * @param {*} message
   * @returns
   */
  sendAPIResponse(resp, data, status, message) {
    let response = {
      status: status,
      data: data,
      message: message,
    };
    return resp.status(status).json(response);
  }
}
export default new HttpResponse();
