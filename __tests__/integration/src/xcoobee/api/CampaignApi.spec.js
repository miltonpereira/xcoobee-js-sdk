import ApiAccessTokenCache from '../../../../../src/xcoobee/api/ApiAccessTokenCache';
import CampaignApi from '../../../../../src/xcoobee/api/CampaignApi';
import UsersCache from '../../../../../src/xcoobee/api/UsersCache';

import XcooBeeError from '../../../../../src/xcoobee/core/XcooBeeError';

const apiUrlRoot = process.env.XCOOBEE__API_URL_ROOT || 'https://testapi.xcoobee.net/Test';
const apiKey = process.env.XCOOBEE__API_KEY;
const apiSecret = process.env.XCOOBEE__API_SECRET;

jest.setTimeout(60000);

describe('CampaignApi', function () {

  const apiAccessTokenCache = new ApiAccessTokenCache();
  const usersCache = new UsersCache(apiAccessTokenCache);

  describe('.getCampaignInfo', function () {

    describe('called with a valid API access token', function () {

      describe('and called with a known campaign cursor', function () {

        it('should return with expected campaign info', async function (done) {
          const apiAccessToken = await apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
          const campaignCursor = 'CTZamTgKRBUqJsavV4+R8NnwaIv/mcLqI+enjUFlcARTKRidhcY4K0rbAb4KJDIL1uaaAA==';
          const consentCampaign = await CampaignApi.getCampaignInfo(apiUrlRoot, apiAccessToken, campaignCursor);
          expect(consentCampaign).toBeDefined();
          expect(consentCampaign.campaign_description.text).toBe(undefined);
          expect(consentCampaign.campaign_name).toBe('xcoobee test campaign');
          expect(consentCampaign.campaign_title.text).toBe(undefined);
          expect(consentCampaign.date_c).toBeDefined();
          expect(consentCampaign.date_e).toBeDefined();
          expect(consentCampaign.email_targets).toBeInstanceOf(Array);
          expect(consentCampaign.email_targets.length).toBe(0);
          expect(consentCampaign.endpoint).toBe(null);
          expect(consentCampaign.status).toBe('active');
          expect(consentCampaign.targets).toBeInstanceOf(Array);
          expect(consentCampaign.targets.length).toBe(0);
          expect(consentCampaign.xcoobee_targets).toBeInstanceOf(Array);
          expect(consentCampaign.xcoobee_targets.length).toBe(0);

          done();
        });// eo it

      });// eo describe

      describe('and called with an unknown campaign cursor', function () {

        it('should return with no data', async function (done) {
          const apiAccessToken = await apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
          const campaignCursor = 'unknown';
          try {
            await CampaignApi.getCampaignInfo(apiUrlRoot, apiAccessToken, campaignCursor);
            // This should not be called.
            expect(true).toBe(false);
          } catch (err) {
            expect(err).toBeInstanceOf(XcooBeeError);
            expect(err.message).toBe('Wrong key at line: 3, column: 7');
            expect(err.name).toBe('XcooBeeError');

            done();
          }
        });// eo it

      });// eo describe

    });// eo describe

  });// eo describe('.getCampaignInfo')

  describe('.getCampaigns', function () {

    describe('called with a valid API access token', function () {

      it('should return the user\'s campaigns', async function (done) {
        const apiAccessToken = await apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
        const user = await usersCache.get(apiUrlRoot, apiKey, apiSecret);
        const userCursor = user.cursor;
        const campaigns = await CampaignApi.getCampaigns(apiUrlRoot, apiAccessToken, userCursor);
        expect(campaigns).toBeInstanceOf(Array);
        expect(campaigns.length).toBe(1);
        const campaign = campaigns[0];
        expect(campaign).toBeDefined();
        expect(campaign.campaign_cursor).toBe('CTZamTgKRBUqJsavV4+R8NnwaIv/mcLqI+enjUFlcARTKRidhcY4K0rbAb4KJDIL1uaaAA==');
        expect(campaign.campaign_name).toBe('xcoobee test campaign');
        expect(campaign.status).toBe('active');

        done();
      });// eo it

    });// eo describe

  });// eo describe('.getCampaigns')

});// eo describe('CampaignApi')
