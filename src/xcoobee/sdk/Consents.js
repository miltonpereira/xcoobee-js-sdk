import Path from 'path';

import CampaignApi from '../../xcoobee/api/CampaignApi';
import ConsentsApi from '../../xcoobee/api/ConsentsApi';
import ConversationsApi from '../../xcoobee/api/ConversationsApi';
import DirectiveApi from '../../xcoobee/api/DirectiveApi';
import UploadPolicyIntents from '../../xcoobee/api/UploadPolicyIntents';

import XcooBeeError from '../core/XcooBeeError';

import ErrorResponse from './ErrorResponse';
import FileUtils from './FileUtils';
import SdkUtils from './SdkUtils';
import SuccessResponse from './SuccessResponse';

/**
 * The Consents service.
 */
class Consents {

  constructor(config, apiAccessTokenCache, usersCache) {
    this._ = {
      apiAccessTokenCache,
      config: config || null,
      usersCache,
    };
  }

  set config(config) {
    this._.config = config;
  }

  _assertValidState() {
    if (!this._.config) {
      throw TypeError('Illegal State: Default config has not been set yet.');
    }
  }

  // TODO: Document CampaignId
  // TODO: Document CampaignStruct
  // * @returns {string} return.response.results.campaign_name
  // * @returns {?} return.response.results.date_c
  // * @returns {?} return.response.results.date_e
  // * @returns {?} return.response.results.status
  // * @returns {?} return.response.results.xcoobee_targets
  // * @returns {?} return.response.results.xcoobee_targets.xcoobee_id

  // TODO: Document ConsentId
  // TODO: Document RequestRefId

  /**
   * Determines whether data has been changed according to changes requested.
   *
   * @async
   * @param {ConsentId} consentId - The consent ID of the data being confirmed.
   * @param {Config} [config] - If specified, the configuration to use instead of the
   *   default.
   *
   * @returns {Promise<SuccessResponse|ErrorResponse, undefined>}
   * @property {number} code - The response status code.
   * @property {Error} [error] - The response error if status is not successful.
   * @property {string} [error.message] - The error message.
   * @property {string} request_id - The ID of the request generated by the XcooBee
   *   system.
   * @property {Object} [result] - The result of the response if status is successful.
   * @property {boolean} result.confirmed - Flag indicating whether the change is
   *   confirmed.
   *
   * @throws {XcooBeeError}
   */
  async confirmConsentChange(consentId, config) {
    this._assertValidState();
    const apiCfg = SdkUtils.resolveApiCfg(config, this._.config);
    const { apiKey, apiSecret, apiUrlRoot } = apiCfg;

    try {
      const apiAccessToken = await this._.apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
      const result = await ConsentsApi.confirmConsentChange(apiUrlRoot, apiAccessToken, consentId);
      const response = new SuccessResponse(result);
      return response;
    } catch (err) {
      return new ErrorResponse(400, err);
    }
  }

  /**
   * Determines whether data has been deleted/purged from data holder.
   *
   * @async
   * @param {ConsentId} consentId - The consent ID of the data being confirmed.
   * @param {Config} [config] - If specified, the configuration to use instead of the
   *   default.
   *
   * @returns {Promise<SuccessResponse|ErrorResponse, undefined>}
   * @property {number} code - The response status code.
   * @property {Error} [error] - The response error if status is not successful.
   * @property {string} [error.message] - The error message.
   * @property {string} request_id - The ID of the request generated by the XcooBee
   *   system.
   * @property {Object} [result] - The result of the response if status is successful.
   * @property {boolean} result.confirmed - Flag indicating whether the consent data
   *   was deleted.
   *
   * @throws {XcooBeeError}
   */
  async confirmDataDelete(consentId, config) {
    this._assertValidState();
    const apiCfg = SdkUtils.resolveApiCfg(config, this._.config);
    const { apiKey, apiSecret, apiUrlRoot } = apiCfg;

    try {
      const apiAccessToken = await this._.apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
      const result = await ConsentsApi.confirmDataDelete(apiUrlRoot, apiAccessToken, consentId);
      const response = new SuccessResponse(result);
      return response;
    } catch (err) {
      return new ErrorResponse(400, err);
    }
  }

  /**
   * Fetches the campaign's basic information for the campaign with the specified
   * ID.
   *
   * @async
   * @param {CampaignId} [campaignId] - The ID of the campaign to fetch.  If not specified
   *   or is `undefined`, then the default campaign ID is used if set.  If a campaign
   *   ID cannot be resolved, then a `XcooBeeError` will be thrown.
   * @param {Config} [config] - If specified, the configuration to use instead of the
   *   default.
   *
   * @returns {Promise<SuccessResponse|ErrorResponse, undefined>} - The response.
   * @property {number} code - The response status code.
   * @property {Error} [error] - The response error if status is not successful.
   * @property {string} [error.message] - The error message.
   * @property {string} request_id - The ID of the request generated by the XcooBee
   *   system.
   * @property {Object} [result] - The result of the response if status is successful.
   * @property {CampaignStruct} result.campaign - The campaign information.
   *
   * @throws {XcooBeeError}
   */
  async getCampaignInfo(campaignId, config) {
    this._assertValidState();
    const resolvedCampaignId = SdkUtils.resolveCampaignId(campaignId, config, this._.config);
    const apiCfg = SdkUtils.resolveApiCfg(config, this._.config);
    const { apiKey, apiSecret, apiUrlRoot } = apiCfg;

    try {
      const apiAccessToken = await this._.apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
      const result = await CampaignApi.getCampaignInfo(apiUrlRoot, apiAccessToken, resolvedCampaignId);
      const response = new SuccessResponse(result);
      return response;
    } catch (err) {
      return new ErrorResponse(400, err);
    }
  }

  /**
   * Fetches the consent data with the specified ID.
   *
   * @async
   * @param {ConsentId} consentId - The ID of the consent to fetch.
   * @param {Config} [config] - If specified, the configuration to use instead of the
   *   default.
   *
   * @returns {Promise<SuccessResponse|ErrorResponse, undefined>} - The response.
   * @property {number} code - The response status code.
   * @property {Error} [error] - The response error if status is not successful.
   * @property {string} [error.message] - The error message.
   * @property {string} request_id - The ID of the request generated by the XcooBee
   *   system.
   * @property {Object} [result] - The result of the response if status is successful.
   * @property {ConsentStruct} result.consent - The consent data.
   *
   * @throws {XcooBeeError}
   */
  async getConsentData(consentId, config) {
    this._assertValidState();
    const apiCfg = SdkUtils.resolveApiCfg(config, this._.config);
    const { apiKey, apiSecret, apiUrlRoot } = apiCfg;

    try {
      const apiAccessToken = await this._.apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
      const result = await ConsentsApi.getConsentData(apiUrlRoot, apiAccessToken, consentId);
      const response = new SuccessResponse(result);
      return response;
    } catch (err) {
      return new ErrorResponse(400, err);
    }
  }

  /**
   * Fetches an existing user's cookie consent information.
   *
   * @async
   * @param {XcooBeeId} xcoobeeId - The XcooBee ID for which to fetch cookie consent
   *   information.
   * @param {CampaignId} [campaignId] - The ID of the campaign to use.  If not
   *   specified or is `undefined`, then the default campaign ID is used if set.  If a
   *   campaign ID cannot be resolved, then a `XcooBeeError` will be thrown.
   * @param {Config} [config] - If specified, the configuration to use instead of the
   *   default.
   *
   * @returns {Promise<SuccessResponse|ErrorResponse, undefined>} - The response.
   * @property {number} code - The response status code.
   * @property {Error} [error] - The response error if status is not successful.
   * @property {string} [error.message] - The error message.
   * @property {string} request_id - The ID of the request generated by the XcooBee
   *   system.
   * @property {Object} [result] - The result of the response if status is successful.
   * @property {Object<ConsentDataType, boolean>} result.cookie_consents - The cookie
   *   consent information.
   *
   * @throws {XcooBeeError}
   */
  async getCookieConsent(xcoobeeId, campaignId, config) {
    this._assertValidState();
    const resolvedCampaignId = SdkUtils.resolveCampaignId(campaignId, config, this._.config);
    const apiCfg = SdkUtils.resolveApiCfg(config, this._.config);
    const { apiKey, apiSecret, apiUrlRoot } = apiCfg;

    try {
      const apiAccessToken = await this._.apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
      const user = await this._.usersCache.get(apiUrlRoot, apiKey, apiSecret)
      const userCursor = user.cursor;
      const result = await ConsentsApi.getCookieConsent(apiUrlRoot, apiAccessToken, xcoobeeId, userCursor, resolvedCampaignId);
      const response = new SuccessResponse(result);
      return response;
    } catch (err) {
      return new ErrorResponse(400, err);
    }
  }

  /**
   * Fetches a page of campaigns.
   *
   * @async
   * @param {Config} [config] - If specified, the configuration to use instead of the
   *   default.
   *
   * @returns {Promise<SuccessResponse|ErrorResponse, undefined>} - The response.
   * @property {number} code - The response status code.
   * @property {Error} [error] - The response error if status is not successful.
   * @property {string} [error.message] - The error message.
   * @property {string} request_id - The ID of the request generated by the XcooBee
   *   system.
   * @property {Object} [result] - The result of the response if status is successful.
   * @property {Campaign[]} result.data - Campaigns for this page.
   * @property {Object} [result.page_info] - The page information.
   * @property {boolean} result.page_info.has_next_page - Flag indicating whether there is
   *   another page of data to may be fetched.
   * @property {string} result.page_info.end_cursor - The end cursor.
   *
   * @throws {XcooBeeError}
   */
  async listCampaigns(config) {
    this._assertValidState();

    const fetchPage = async (apiCfg, params) => {
      const { apiKey, apiSecret, apiUrlRoot } = apiCfg;
      const { after, first } = params;
      const apiAccessToken = await this._.apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
      const user = await this._.usersCache.get(apiUrlRoot, apiKey, apiSecret)
      const userCursor = user.cursor;
      const campaignsPage = await CampaignApi.getCampaigns(apiUrlRoot, apiAccessToken, userCursor, after, first);
      return campaignsPage;
    };
    const apiCfg = SdkUtils.resolveApiCfg(config, this._.config);
    const params = {};

    return SdkUtils.startPaging(fetchPage, apiCfg, params);
  }

  /**
   * Fetches a page of consents with the given status.
   *
   * @async
   * @param {ConsentStatus} status
   * @param {Config} [config] - If specified, the configuration to use instead of the
   *   default.
   *
   * @returns {Promise<SuccessResponse|ErrorResponse, undefined>} - The response.
   * @property {number} code - The response status code.
   * @property {Error} [error] - The response error if status is not successful.
   * @property {string} [error.message] - The error message.
   * @property {string} request_id - The ID of the request generated by the XcooBee
   *   system.
   * @property {Object} [result] - The result of the response if status is successful.
   * @property {Campaign[]} result.data - Consents for this page.
   * @property {Object} [result.page_info] - The page information.
   * @property {boolean} result.page_info.has_next_page - Flag indicating whether there is
   *   another page of data to may be fetched.
   * @property {string} result.page_info.end_cursor - The end cursor.
   *
   * @throws {XcooBeeError}
   */
  async listConsents(status, config) {
    this._assertValidState();

    const fetchPage = async (apiCfg, params) => {
      const { apiKey, apiSecret, apiUrlRoot } = apiCfg;
      const { after, first, status } = params;
      const apiAccessToken = await this._.apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
      const user = await this._.usersCache.get(apiUrlRoot, apiKey, apiSecret)
      const userCursor = user.cursor;
      const consentsPage = await ConsentsApi.listConsents(apiUrlRoot, apiAccessToken, userCursor, status, after, first);
      return consentsPage;
    };
    const apiCfg = SdkUtils.resolveApiCfg(config, this._.config);
    const params = { status };

    return SdkUtils.startPaging(fetchPage, apiCfg, params);
  }

  /**
   * Requests consent from the specified user.
   *
   * @async
   * @param {XcooBeeId} xcoobeeId - The XcooBee ID from which consent is being
   *   requested.
   * @param {RequestRefId} reqRefId - A request reference ID generated by you that
   *   identifies this request.  This ID will be returned in the `ConsentApproved`
   *   and `ConsentDeclined` consent events.  May be a maximum of 64 characters long.
   * @param {CampaignId} [campaignId] - The ID of the campaign for which consent is
   *   being requested.  If not specified or is `undefined`, then the default campaign
   *   ID is used if set.  If a campaign ID cannot be resolved, then a `XcooBeeError`
   *   will be thrown.
   * @param {Config} [config] - If specified, the configuration to use instead of the
   *   default.
   *
   * @returns {Promise<SuccessResponse|ErrorResponse, undefined>} - The response.
   * @property {number} code - The response status code.
   * @property {Error} [error] - The response error if status is not successful.
   * @property {string} [error.message] - The error message.
   * @property {string} request_id - The ID of the request generated by the XcooBee
   *   system.
   * @property {Object} [result] - The result of the response if status is successful.
   * @property {string} result.ref_id
   *
   * @throws {XcooBeeError}
   */
  async requestConsent(xcoobeeId, reqRefId, campaignId, config) {
    this._assertValidState();
    const resolvedCampaignId = SdkUtils.resolveCampaignId(campaignId, config, this._.config);
    const apiCfg = SdkUtils.resolveApiCfg(config, this._.config);
    const { apiKey, apiSecret, apiUrlRoot } = apiCfg;

    try {
      const apiAccessToken = await this._.apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
      const result = await ConsentsApi.requestConsent(apiUrlRoot, apiAccessToken, xcoobeeId, resolvedCampaignId, reqRefId);
      const response = new SuccessResponse(result);
      return response;
    } catch (err) {
      return new ErrorResponse(400, err);
    }
  }

  /**
   * Sends a response to a user-data request.  This call will send a message to the
   * user's communication center.
   *
   * Standard hiring points will be deducted for this.
   *
   * @async
   * @param {string} message - The message to be sent to the user.
   * @param {ConsentId} consentId - The ID of the consent to which you are responding.
   * @param {RequestRefId} reqRefId - A request reference ID generated by you that
   *   identifies this request.  This ID will be returned in the `UserDataRequest`
   *   consent events.  May be a maximum of 64 characters long.
   * @param {string[]} files - The user's data being requested.
   * @param {Config} [config] - If specified, the configuration to use instead of the
   *   default.
   *
   * @returns {Promise<SuccessResponse|ErrorResponse, undefined>}
   * @property {number} code - The response status code.
   * @property {Error} [error] - The response error if status is not successful.
   * @property {string} [error.message] - The error message.
   * @property {string} request_id - The ID of the request generated by the XcooBee
   *   system.
   * @property {Object} [result] - The result of the response if status is successful.
   * @property {string[]} result.progress - A set of progress messages. Each message
   *   will begin with the word `'failed'` or `'successfully'`.
   * @property {string} result.ref_id - A reference ID generated by the XcooBee
   *   system.
   *
   * @throws {XcooBeeError}
   */
  async setUserDataResponse(message, consentId, reqRefId, files, config) {
    this._assertValidState();
    const apiCfg = SdkUtils.resolveApiCfg(config, this._.config);
    const { apiKey, apiSecret, apiUrlRoot } = apiCfg;

    const errors = [];
    const progress = [];
    let response;
    try {
      const apiAccessToken = await this._.apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
      const user = await this._.usersCache.get(apiUrlRoot, apiKey, apiSecret)
      const userCursor = user.cursor;
      const breachId = null;
      await ConversationsApi.sendUserMessage(
        apiUrlRoot, apiAccessToken, message, userCursor, consentId, breachId
      );
      progress.push('successfully sent message');

      let results = { progress, ref_id: null };
      if (reqRefId && Array.isArray(files) && files.length > 0) {
        const endPointName = UploadPolicyIntents.OUTBOX;
        const fileUploadResults = await FileUtils.upload(apiUrlRoot, apiAccessToken, userCursor, endPointName, files);

        const successfullyUploadedFiles = [];
        fileUploadResults.forEach(result => {
          const { error, file, success } = result;
          if (success) {
            successfullyUploadedFiles.push(file);
            progress.push(`successfully uploaded ${file}`);
          } else {
            errors.push(`Failed to upload file: ${file}. Error: ${error}.`);
            progress.push(`failed upload on ${file}`);
          }
        });

        if (successfullyUploadedFiles.length > 0) {
          const xcoobee_id = await ConsentsApi.resolveXcoobeeId(apiUrlRoot, apiAccessToken, consentId);
          const filenames = successfullyUploadedFiles.map(path => Path.basename(path));
          const directiveInput = {
            destinations: [{ xcoobee_id }],
            filenames,
            user_reference: reqRefId,
          };
          const refId = await DirectiveApi.addDirective(apiUrlRoot, apiAccessToken, directiveInput);
          progress.push('successfully sent successfully uploaded files to destination');
          results.ref_id = refId;
        }
      }
      response = new SuccessResponse(results);
    } catch (err) {
      errors.push(err.message);
    }
    if (errors.length > 0) {
      const err = errors.join(' ');
      response = new ErrorResponse(400, new XcooBeeError(err));
    }
    return response;
  }

}// eo class Consents

export default Consents;
