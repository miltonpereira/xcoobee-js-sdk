const ErrorResponse = require('./ErrorResponse');
const Response = require('./Response');

/**
 * A response representing a successful response that allows paging to the next
 * page of data if available.
 */
class PagingResponse extends Response {

  /**
   * @param {function} fetcher
   * @param {Object} currentPage
   * @param {Object} apiCfg
   * @param {Object} params
   */
  constructor(fetcher, currentPage, apiCfg, params) {
    super({
      apiCfg,
      code: 200,
      currentPage,
      error: null,
      fetcher,
      hasNextPage: currentPage.page_info.has_next_page,
      params,
      result: currentPage,
    });
  }

  /**
   * @returns {Promise<PagingResponse, ErrorResponse>}
   */
  async getNextPage() {
    if (this.hasNextPage()) {
      const {
        apiCfg,
        currentPage,
        fetcher,
        params,
      } = this._;

      const nextParams = {
        ...params,
        after: currentPage.page_info.end_cursor,
      };
      try {
        const nextPage = await this._.fetcher(apiCfg, nextParams);
        return new PagingResponse(fetcher, nextPage, apiCfg, params);
      } catch (err) {
        throw new ErrorResponse(400, err);
      }
    }
    return null;
  }

}

module.exports = PagingResponse;
