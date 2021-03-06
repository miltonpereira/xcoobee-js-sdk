const ApiAccessTokenCache = require('../../../../../src/xcoobee/api/ApiAccessTokenCache');
const UsersCache = require('../../../../../src/xcoobee/api/UsersCache');
const CampaignApi = require('../../../../../src/xcoobee/api/CampaignApi');

const XcooBeeError = require('../../../../../src/xcoobee/core/XcooBeeError');

const Config = require('../../../../../src/xcoobee/sdk/Config');
const ErrorResponse = require('../../../../../src/xcoobee/sdk/ErrorResponse');
const PagingResponse = require('../../../../../src/xcoobee/sdk/PagingResponse');
const SuccessResponse = require('../../../../../src/xcoobee/sdk/SuccessResponse');
const System = require('../../../../../src/xcoobee/sdk/System');

const { addTestEventSubscriptions, deleteAllEventSubscriptions } = require('../../../../lib/EventSubscriptionUtils');
const { assertIsCursorLike, assertIso8601Like } = require('../../../../lib/Utils');

const apiUrlRoot = process.env.XCOOBEE__API_URL_ROOT || 'https://testapi.xcoobee.net/Test';
const apiKey = process.env.XCOOBEE__API_KEY;
const apiSecret = process.env.XCOOBEE__API_SECRET;

jest.setTimeout(60000);

describe('System', () => {

  const apiAccessTokenCache = new ApiAccessTokenCache();
  const usersCache = new UsersCache(apiAccessTokenCache);

  const getCampaignId = async () => {
    const apiAccessToken = await apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
    const user = await usersCache.get(apiUrlRoot, apiKey, apiSecret);
    const userCursor = user.cursor;
    const campaigns = await CampaignApi.getCampaigns(apiUrlRoot, apiAccessToken, userCursor);
    return campaigns.data[0].campaign_cursor;
  };

  beforeAll(async (done) => {
    const campaignId = await getCampaignId();
    await deleteAllEventSubscriptions(apiAccessTokenCache, apiUrlRoot, apiKey, apiSecret, campaignId);

    done();
  });

  describe('instance', () => {

    describe('.addEventSubscription', () => {

      describe('called with a valid API key/secret pair', () => {

        describe('and a known campaign ID', () => {

          describe('and a valid events mapping', () => {

            afterEach(async (done) => {
              const campaignId = await getCampaignId();
              await deleteAllEventSubscriptions(apiAccessTokenCache, apiUrlRoot, apiKey, apiSecret, campaignId);

              done();
            });

            describe('using default config', () => {

              it('should add the event subscriptions for the campaign', async (done) => {
                const campaignId = await getCampaignId();
                const defaultConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId,
                });
                const eventsMapping = {
                  ConsentApproved: 'OnConsentApproved',
                  DataDeclined: 'OnDataDeclined',
                };

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                const response = await systemSdk.addEventSubscription(eventsMapping);
                expect(response).toBeInstanceOf(SuccessResponse);
                const { result } = response;
                expect(result).toBeDefined();
                const eventSubscriptionsPage = result;
                expect(eventSubscriptionsPage.data).toBeInstanceOf(Array);
                expect(eventSubscriptionsPage.data.length).toBe(2);
                let eventSubscription = eventSubscriptionsPage.data[0];
                expect(eventSubscription.campaign_cursor).toBe(campaignId);
                // assertIso8601Like(eventSubscription.date_c);
                expect(eventSubscription.date_c).toBe(null);
                if (eventSubscription.event_type === 'consent_approved') {
                  expect(eventSubscription.handler).toBe('OnConsentApproved');
                } else if (eventSubscription.event_type === 'data_declined') {
                  expect(eventSubscription.handler).toBe('OnDataDeclined');
                } else {
                  // This should not be called.
                  expect(true).toBe(false);
                }
                assertIsCursorLike(eventSubscription.owner_cursor);
                expect(eventSubscriptionsPage.page_info).toBe(null);

                eventSubscription = eventSubscriptionsPage.data[1];
                expect(eventSubscription.campaign_cursor).toBe(campaignId);
                // assertIso8601Like(eventSubscription.date_c);
                expect(eventSubscription.date_c).toBe(null);
                if (eventSubscription.event_type === 'consent_approved') {
                  expect(eventSubscription.handler).toBe('OnConsentApproved');
                } else if (eventSubscription.event_type === 'data_declined') {
                  expect(eventSubscription.handler).toBe('OnDataDeclined');
                } else {
                  // This should not be called.
                  expect(true).toBe(false);
                }
                assertIsCursorLike(eventSubscription.owner_cursor);
                expect(eventSubscriptionsPage.page_info).toBe(null);

                done();
              });// eo it

            });// eo describe

            describe('using campaign ID', () => {

              it('should add the event subscriptions for the campaign', async (done) => {
                const defaultConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId: 'default-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
                });
                const campaignId = await getCampaignId();
                const eventsMapping = {
                  ConsentApproved: 'OnConsentApproved',
                };

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                const response = await systemSdk.addEventSubscription(eventsMapping, campaignId);
                expect(response).toBeInstanceOf(SuccessResponse);
                const { result } = response;
                expect(result).toBeDefined();
                const eventSubscriptionsPage = result;
                expect(eventSubscriptionsPage.data).toBeInstanceOf(Array);
                expect(eventSubscriptionsPage.data.length).toBe(1);
                const eventSubscription = eventSubscriptionsPage.data[0];
                expect(eventSubscription.campaign_cursor).toBe(campaignId);
                // assertIso8601Like(eventSubscription.date_c);
                expect(eventSubscription.date_c).toBe(null);
                expect(eventSubscription.event_type).toBe('consent_approved');
                expect(eventSubscription.handler).toBe('OnConsentApproved');
                assertIsCursorLike(eventSubscription.owner_cursor);
                expect(eventSubscriptionsPage.page_info).toBe(null);

                done();
              });// eo it

            });// eo describe

            describe('using campaign ID and overriding config', () => {

              it('should add the event subscriptions for the campaign', async (done) => {
                const defaultConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId: 'default-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
                });
                const overridingConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId: 'overriding-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
                });
                const campaignId = await getCampaignId();
                const eventsMapping = {
                  ConsentApproved: 'OnConsentApproved',
                };

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                const response = await systemSdk.addEventSubscription(eventsMapping, campaignId, overridingConfig);
                expect(response).toBeInstanceOf(SuccessResponse);
                const { result } = response;
                expect(result).toBeDefined();
                const eventSubscriptionsPage = result;
                expect(eventSubscriptionsPage.data).toBeInstanceOf(Array);
                expect(eventSubscriptionsPage.data.length).toBe(1);
                const eventSubscription = eventSubscriptionsPage.data[0];
                expect(eventSubscription.campaign_cursor).toBe(campaignId);
                // assertIso8601Like(eventSubscription.date_c);
                expect(eventSubscription.date_c).toBe(null);
                expect(eventSubscription.event_type).toBe('consent_approved');
                expect(eventSubscription.handler).toBe('OnConsentApproved');
                assertIsCursorLike(eventSubscription.owner_cursor);
                expect(eventSubscriptionsPage.page_info).toBe(null);

                done();
              });// eo it

            });// eo describe

            describe('using overriding config', () => {

              it('should add the event subscriptions for the campaign', async (done) => {
                const campaignId = await getCampaignId();
                const defaultConfig = new Config({
                  apiKey: 'should_be_unused',
                  apiSecret: 'should_be_unused',
                  apiUrlRoot: 'should_be_unused',
                  campaignId: 'default-campaign-id',
                });
                const overridingConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId,
                });
                const eventsMapping = {
                  ConsentApproved: 'OnConsentApproved',
                  DataDeclined: 'OnDataDeclined',
                };

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                const response = await systemSdk.addEventSubscription(eventsMapping, null, overridingConfig);
                expect(response).toBeInstanceOf(SuccessResponse);
                const { result } = response;
                expect(result).toBeDefined();
                const eventSubscriptionsPage = result;
                expect(eventSubscriptionsPage.data).toBeInstanceOf(Array);
                expect(eventSubscriptionsPage.data.length).toBe(2);
                let eventSubscription = eventSubscriptionsPage.data[0];
                expect(eventSubscription.campaign_cursor).toBe(campaignId);
                // assertIso8601Like(eventSubscription.date_c);
                expect(eventSubscription.date_c).toBe(null);
                if (eventSubscription.event_type === 'consent_approved') {
                  expect(eventSubscription.handler).toBe('OnConsentApproved');
                } else if (eventSubscription.event_type === 'data_declined') {
                  expect(eventSubscription.handler).toBe('OnDataDeclined');
                } else {
                  // This should not be called.
                  expect(true).toBe(false);
                }
                assertIsCursorLike(eventSubscription.owner_cursor);
                expect(eventSubscriptionsPage.page_info).toBe(null);

                eventSubscription = eventSubscriptionsPage.data[1];
                expect(eventSubscription.campaign_cursor).toBe(campaignId);
                // assertIso8601Like(eventSubscription.date_c);
                expect(eventSubscription.date_c).toBe(null);
                if (eventSubscription.event_type === 'consent_approved') {
                  expect(eventSubscription.handler).toBe('OnConsentApproved');
                } else if (eventSubscription.event_type === 'data_declined') {
                  expect(eventSubscription.handler).toBe('OnDataDeclined');
                } else {
                  // This should not be called.
                  expect(true).toBe(false);
                }
                assertIsCursorLike(eventSubscription.owner_cursor);
                expect(eventSubscriptionsPage.page_info).toBe(null);

                done();
              });// eo it

            });// eo describe

          });// eo describe

          describe('and an invalid events mapping', () => {

            it('should reject with an error response', async (done) => {
              const campaignId = await getCampaignId();
              const defaultConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId,
              });
              const overridingConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId,
              });
              const eventsMapping = {
                Invalid: 'invalid',
              };

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

              try {
                await systemSdk.addEventSubscription(eventsMapping);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Invalid event type provided: "Invalid".');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.addEventSubscription(eventsMapping, campaignId);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Invalid event type provided: "Invalid".');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.addEventSubscription(eventsMapping, campaignId, overridingConfig);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Invalid event type provided: "Invalid".');
                expect(error.name).toBe('XcooBeeError');
              }

              done();
            });// eo it

          });// eo describe

        });// eo describe

        describe('and unknown campaign ID', () => {

          describe('using default config', () => {

            it('should reject with an error response', async (done) => {
              const defaultConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: 'unknown',
              });
              const eventsMapping = {
                ConsentApproved: 'OnConsentApproved',
              };

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

              try {
                await systemSdk.addEventSubscription(eventsMapping);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.addEventSubscription(eventsMapping, null);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.addEventSubscription(eventsMapping, null, { apiKey, apiSecret });
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              done();
            });// eo it

          });// eo describe

          describe('using overriding config', () => {

            it('should reject with an error response', async (done) => {
              const campaignId = await getCampaignId();
              const defaultConfig = new Config({
                apiKey: 'should_be_unused',
                apiSecret: 'should_be_unused',
                apiUrlRoot: 'should_be_unused',
                campaignId,
              });
              const overridingConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: 'unknown',
              });
              const eventsMapping = {
                ConsentApproved: 'OnConsentApproved',
              };

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

              try {
                await systemSdk.addEventSubscription(eventsMapping, null, overridingConfig);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              done();
            });// eo it

          });// eo describe

          describe('using campaign ID', () => {

            it('should reject with an error response', async (done) => {
              const campaignIdReal = await getCampaignId();
              const defaultConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: campaignIdReal,
              });
              const overridingConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: campaignIdReal,
              });
              const campaignId = 'unknown';
              const eventsMapping = {
                ConsentApproved: 'OnConsentApproved',
              };

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

              try {
                await systemSdk.addEventSubscription(eventsMapping, campaignId);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.addEventSubscription(eventsMapping, campaignId, overridingConfig);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              done();
            });// eo it

          });// eo describe

        });// eo describe

      });// eo describe

    });// eo describe('.addEventSubscription')

    describe('.deleteEventSubscription', () => {

      describe('called with a valid API key/secret pair', () => {

        describe('and a known campaign ID', () => {

          describe('and a valid events mapping', () => {

            beforeEach(async (done) => {
              const campaignId = await getCampaignId();
              await addTestEventSubscriptions(apiAccessTokenCache, apiUrlRoot, apiKey, apiSecret, campaignId);

              done();
            });

            describe('using default config', () => {

              it('should delete both of the event subscriptions', async (done) => {
                const campaignId = await getCampaignId();
                const defaultConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId,
                });
                const eventTypes = ['ConsentApproved', 'DataDeclined'];

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                const response = await systemSdk.deleteEventSubscription(eventTypes);
                expect(response).toBeInstanceOf(SuccessResponse);
                const { deleted_number } = response.result;
                expect(deleted_number).toBe(2);

                done();
              });// eo it

              it('should delete each of the event subscriptions', async (done) => {
                const campaignId = await getCampaignId();
                const defaultConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId,
                });
                let eventTypes = ['ConsentApproved'];

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                let response = await systemSdk.deleteEventSubscription(eventTypes);
                expect(response).toBeInstanceOf(SuccessResponse);
                let { deleted_number } = response.result;
                expect(deleted_number).toBe(1);

                eventTypes = ['DataDeclined'];
                response = await systemSdk.deleteEventSubscription(eventTypes);
                expect(response).toBeInstanceOf(SuccessResponse);
                deleted_number = response.result.deleted_number;
                expect(deleted_number).toBe(1);

                done();
              });// eo it

            });// eo describe

            describe('using campaign ID', () => {

              it('should delete both of the event subscriptions', async (done) => {
                const defaultConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId: 'default-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
                });
                const eventTypes = ['ConsentApproved', 'DataDeclined'];
                const campaignId = await getCampaignId();

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                const response = await systemSdk.deleteEventSubscription(eventTypes, campaignId);
                expect(response).toBeInstanceOf(SuccessResponse);
                const { deleted_number } = response.result;
                expect(deleted_number).toBe(2);

                done();
              });// eo it

              it('should delete each of the event subscriptions', async (done) => {
                const defaultConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId: 'default-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
                });
                let eventTypes = ['ConsentApproved'];
                const campaignId = await getCampaignId();

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                let response = await systemSdk.deleteEventSubscription(eventTypes, campaignId);
                expect(response).toBeInstanceOf(SuccessResponse);
                let { deleted_number } = response.result;
                expect(deleted_number).toBe(1);

                eventTypes = ['DataDeclined'];
                response = await systemSdk.deleteEventSubscription(eventTypes, campaignId);
                expect(response).toBeInstanceOf(SuccessResponse);
                deleted_number = response.result.deleted_number;
                expect(deleted_number).toBe(1);

                done();
              });// eo it

            });// eo describe

            describe('using campaign ID and overriding config', () => {

              it('should delete both of the event subscriptions', async (done) => {
                const defaultConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId: 'default-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
                });
                const overridingConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId: 'overriding-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
                });
                const campaignId = await getCampaignId();
                const eventTypes = ['ConsentApproved', 'DataDeclined'];

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                const response = await systemSdk.deleteEventSubscription(eventTypes, campaignId, overridingConfig);
                expect(response).toBeInstanceOf(SuccessResponse);
                const { deleted_number } = response.result;
                expect(deleted_number).toBe(2);

                done();
              });// eo it

              it('should delete each of the event subscriptions', async (done) => {
                const defaultConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId: 'default-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
                });
                const overridingConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId: 'overriding-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
                });
                const campaignId = await getCampaignId();
                let eventTypes = ['ConsentApproved'];

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                let response = await systemSdk.deleteEventSubscription(eventTypes, campaignId, overridingConfig);
                expect(response).toBeInstanceOf(SuccessResponse);
                let { deleted_number } = response.result;
                expect(deleted_number).toBe(1);

                eventTypes = ['DataDeclined'];
                response = await systemSdk.deleteEventSubscription(eventTypes, campaignId, overridingConfig);
                expect(response).toBeInstanceOf(SuccessResponse);
                deleted_number = response.result.deleted_number;
                expect(deleted_number).toBe(1);

                done();
              });// eo it

            });// eo describe

            describe('using overriding config', () => {

              it('should delete both of the event subscriptions', async (done) => {
                const campaignId = await getCampaignId();
                const defaultConfig = new Config({
                  apiKey: 'should_be_unused',
                  apiSecret: 'should_be_unused',
                  apiUrlRoot: 'should_be_unused',
                  campaignId: 'default-campaign-id',
                });
                const overridingConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId,
                });
                const eventTypes = ['ConsentApproved', 'DataDeclined'];

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                const response = await systemSdk.deleteEventSubscription(eventTypes, null, overridingConfig);
                expect(response).toBeInstanceOf(SuccessResponse);
                const { deleted_number } = response.result;
                expect(deleted_number).toBe(2);

                done();
              });// eo it

              it('should delete each of the event subscriptions', async (done) => {
                const campaignId = await getCampaignId();
                const defaultConfig = new Config({
                  apiKey: 'should_be_unused',
                  apiSecret: 'should_be_unused',
                  apiUrlRoot: 'should_be_unused',
                  campaignId: 'default-campaign-id',
                });
                const overridingConfig = new Config({
                  apiKey,
                  apiSecret,
                  apiUrlRoot,
                  campaignId,
                });
                let eventTypes = ['ConsentApproved'];

                const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
                let response = await systemSdk.deleteEventSubscription(eventTypes, null, overridingConfig);
                expect(response).toBeInstanceOf(SuccessResponse);
                let { deleted_number } = response.result;
                expect(deleted_number).toBe(1);

                eventTypes = ['DataDeclined'];
                response = await systemSdk.deleteEventSubscription(eventTypes, null, overridingConfig);
                expect(response).toBeInstanceOf(SuccessResponse);
                deleted_number = response.result.deleted_number;
                expect(deleted_number).toBe(1);

                done();
              });// eo it

            });// eo describe

          });// eo describe

          describe('and an invalid events mapping', () => {

            it('should reject with an error response', async (done) => {
              const campaignId = await getCampaignId();
              const defaultConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId,
              });
              const overridingConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId,
              });
              const eventTypes = ['Invalid'];

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

              try {
                await systemSdk.deleteEventSubscription(eventTypes);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Invalid event type provided: "Invalid".');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.deleteEventSubscription(eventTypes, campaignId);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Invalid event type provided: "Invalid".');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.deleteEventSubscription(eventTypes, campaignId, overridingConfig);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Invalid event type provided: "Invalid".');
                expect(error.name).toBe('XcooBeeError');
              }

              done();
            });// eo it

          });// eo describe

        });// eo describe

        describe('and an unknown campaign ID', async () => {

          describe('using default config', () => {

            it('should reject with an error response', async (done) => {
              const defaultConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: 'unknown',
              });
              const eventTypes = ['ConsentApproved'];

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

              try {
                await systemSdk.deleteEventSubscription(eventTypes);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.deleteEventSubscription(eventTypes, null);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.deleteEventSubscription(eventTypes, null, { apiKey, apiSecret });
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              done();
            });

          });// eo describe

          describe('using overriding config', () => {

            it('should reject with an error response', async (done) => {
              const campaignId = await getCampaignId();
              const defaultConfig = new Config({
                apiKey: 'should_be_unused',
                apiSecret: 'should_be_unused',
                apiUrlRoot: 'should_be_unused',
                campaignId,
              });
              const overridingConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: 'unknown',
              });
              const eventTypes = ['ConsentApproved'];

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

              try {
                await systemSdk.deleteEventSubscription(eventTypes, null, overridingConfig);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              done();
            });// eo it

          });// eo describe

          describe('using campaign ID', () => {

            it('should reject with an error response', async (done) => {
              const campaignIdReal = await getCampaignId();
              const defaultConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: campaignIdReal,
              });
              const overridingConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: campaignIdReal,
              });
              const campaignId = 'unknown';
              const eventTypes = ['ConsentApproved'];

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

              try {
                await systemSdk.deleteEventSubscription(eventTypes, campaignId);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.deleteEventSubscription(eventTypes, campaignId, overridingConfig);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              done();
            });// eo it

          });// eo describe

        });// eo describe

      });// eo describe

    });// eo describe('.deleteEventSubscription')

    describe('.getEvents', () => {

      describe('called with a valid API key/secret pair', () => {

        describe('using default config', () => {

          it('should fetch and return with the user\'s events', async (done) => {
            const defaultConfig = new Config({
              apiKey,
              apiSecret,
              apiUrlRoot,
            });

            const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
            const response = await systemSdk.getEvents();
            expect(response).toBeInstanceOf(PagingResponse);
            expect(response.hasNextPage()).toBe(false);
            const nextPageResponse = await response.getNextPage();
            expect(nextPageResponse).toBe(null);
            const { result } = response;
            expect(result).toBeDefined();
            expect(result.page_info).toBeDefined();
            expect(result.page_info.end_cursor).toBe(null);
            expect(result.page_info.has_next_page).toBe(null);
            const events = result.data;
            expect(events).toBeInstanceOf(Array);
            expect(events.length).toBe(0);

            done();
          });// eo it

        });// eo describe

        describe('using overriding config', () => {

          it('should fetch and return with the user\'s events', async (done) => {
            const defaultConfig = new Config({
              apiKey: 'should_be_unused',
              apiSecret: 'should_be_unused',
              apiUrlRoot: 'should_be_unused',
            });
            const overridingConfig = new Config({
              apiKey,
              apiSecret,
              apiUrlRoot,
            });

            const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
            const response = await systemSdk.getEvents(overridingConfig);
            expect(response).toBeInstanceOf(PagingResponse);
            expect(response.hasNextPage()).toBe(false);
            const nextPageResponse = await response.getNextPage();
            expect(nextPageResponse).toBe(null);
            const { result } = response;
            expect(result).toBeDefined();
            expect(result.page_info).toBeDefined();
            expect(result.page_info.end_cursor).toBe(null);
            expect(result.page_info.has_next_page).toBe(null);
            const events = result.data;
            expect(events).toBeInstanceOf(Array);
            expect(events.length).toBe(0);

            done();
          });// eo it

        });// eo describe

      });// eo describe

      describe('called with an invalid API key/secret pair', () => {

        it('should return with an error response', async (done) => {
          const defaultConfig = new Config({
            apiKey: 'invalid',
            apiSecret: 'invalid',
            apiUrlRoot,
          });

          const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

          try {
            await systemSdk.getEvents();
            // This should not be called.
            expect(true).toBe(false);
          } catch (response) {
            expect(response).toBeInstanceOf(ErrorResponse);
            expect(response.code).toBe(400);
            expect(response.error.message).toBe('Unable to get an API access token.');
          }

          done();
        });// eo it

      });// eo describe

    });// eo describe('.getEvents')

    describe('.listEventSubscriptions', () => {

      describe('called with a valid API key/secret pair', () => {

        describe('and known campaign ID', () => {

          beforeEach(async (done) => {
            const campaignId = await getCampaignId();
            await addTestEventSubscriptions(apiAccessTokenCache, apiUrlRoot, apiKey, apiSecret, campaignId);

            done();
          });

          afterEach(async (done) => {
            const campaignId = await getCampaignId();
            await deleteAllEventSubscriptions(apiAccessTokenCache, apiUrlRoot, apiKey, apiSecret, campaignId);

            done();
          });

          describe('using default config', () => {

            it('should fetch and return with the event subscriptions for the campaign', async (done) => {
              const campaignId = await getCampaignId();
              const defaultConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId,
              });

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
              const response = await systemSdk.listEventSubscriptions();
              expect(response).toBeInstanceOf(PagingResponse);
              expect(response.hasNextPage()).toBe(false);
              const nextPageResponse = await response.getNextPage();
              expect(nextPageResponse).toBe(null);
              const { result } = response;
              expect(result).toBeDefined();
              expect(result.page_info).toBeDefined();
              expect(result.page_info.end_cursor).toBe(null);
              expect(result.page_info.has_next_page).toBe(false);
              const eventSubscriptions = result.data;
              expect(eventSubscriptions).toBeInstanceOf(Array);
              expect(eventSubscriptions.length).toBe(2);
              let eventSubscription = eventSubscriptions[0];
              expect(eventSubscription.campaign_cursor).toBe(campaignId);
              assertIso8601Like(eventSubscription.date_c);
              if (eventSubscription.event_type === 'consent_approved') {
                expect(eventSubscription.handler).toBe('OnConsentApproved');
              } else if (eventSubscription.event_type === 'data_declined') {
                expect(eventSubscription.handler).toBe('OnDataDeclined');
              } else {
                // This should not be called.
                expect(true).toBe(false);
              }
              assertIsCursorLike(eventSubscription.owner_cursor);

              eventSubscription = eventSubscriptions[1];
              expect(eventSubscription.campaign_cursor).toBe(campaignId);
              assertIso8601Like(eventSubscription.date_c);
              if (eventSubscription.event_type === 'consent_approved') {
                expect(eventSubscription.handler).toBe('OnConsentApproved');
              } else if (eventSubscription.event_type === 'data_declined') {
                expect(eventSubscription.handler).toBe('OnDataDeclined');
              } else {
                // This should not be called.
                expect(true).toBe(false);
              }
              assertIsCursorLike(eventSubscription.owner_cursor);

              done();
            });// eo it

          });// eo describe

          describe('using campaign ID', () => {

            it('should fetch and return with the event subscriptions for the campaign', async (done) => {
              const defaultConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: 'default-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
              });
              const campaignId = await getCampaignId();

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
              const response = await systemSdk.listEventSubscriptions(campaignId);
              expect(response).toBeInstanceOf(PagingResponse);
              expect(response.hasNextPage()).toBe(false);
              const nextPageResponse = await response.getNextPage();
              expect(nextPageResponse).toBe(null);
              const { result } = response;
              expect(result).toBeDefined();
              expect(result.page_info).toBeDefined();
              expect(result.page_info.end_cursor).toBe(null);
              expect(result.page_info.has_next_page).toBe(false);
              const eventSubscriptions = result.data;
              expect(eventSubscriptions).toBeInstanceOf(Array);
              expect(eventSubscriptions.length).toBe(2);
              let eventSubscription = eventSubscriptions[0];
              expect(eventSubscription.campaign_cursor).toBe(campaignId);
              assertIso8601Like(eventSubscription.date_c);
              if (eventSubscription.event_type === 'consent_approved') {
                expect(eventSubscription.handler).toBe('OnConsentApproved');
              } else if (eventSubscription.event_type === 'data_declined') {
                expect(eventSubscription.handler).toBe('OnDataDeclined');
              } else {
                // This should not be called.
                expect(true).toBe(false);
              }
              assertIsCursorLike(eventSubscription.owner_cursor);

              eventSubscription = eventSubscriptions[1];
              expect(eventSubscription.campaign_cursor).toBe(campaignId);
              assertIso8601Like(eventSubscription.date_c);
              if (eventSubscription.event_type === 'consent_approved') {
                expect(eventSubscription.handler).toBe('OnConsentApproved');
              } else if (eventSubscription.event_type === 'data_declined') {
                expect(eventSubscription.handler).toBe('OnDataDeclined');
              } else {
                // This should not be called.
                expect(true).toBe(false);
              }
              assertIsCursorLike(eventSubscription.owner_cursor);

              done();
            });// eo it

          });// eo describe

          describe('using overriding config', () => {

            it('should fetch and return with the event subscriptions for the campaign', async (done) => {
              const campaignId = await getCampaignId();
              const defaultConfig = new Config({
                apiKey: 'should_be_unused',
                apiSecret: 'should_be_unused',
                apiUrlRoot: 'should_be_unused',
                campaignId: 'default-campaign-id',
              });
              const overridingConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId,
              });

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
              const response = await systemSdk.listEventSubscriptions(null, overridingConfig);
              expect(response).toBeInstanceOf(PagingResponse);
              expect(response.hasNextPage()).toBe(false);
              const nextPageResponse = await response.getNextPage();
              expect(nextPageResponse).toBe(null);
              const { result } = response;
              expect(result).toBeDefined();
              expect(result.page_info).toBeDefined();
              expect(result.page_info.end_cursor).toBe(null);
              expect(result.page_info.has_next_page).toBe(false);
              const eventSubscriptions = result.data;
              expect(eventSubscriptions).toBeInstanceOf(Array);
              expect(eventSubscriptions.length).toBe(2);
              let eventSubscription = eventSubscriptions[0];
              expect(eventSubscription.campaign_cursor).toBe(campaignId);
              assertIso8601Like(eventSubscription.date_c);
              if (eventSubscription.event_type === 'consent_approved') {
                expect(eventSubscription.handler).toBe('OnConsentApproved');
              } else if (eventSubscription.event_type === 'data_declined') {
                expect(eventSubscription.handler).toBe('OnDataDeclined');
              } else {
                // This should not be called.
                expect(true).toBe(false);
              }
              assertIsCursorLike(eventSubscription.owner_cursor);

              eventSubscription = eventSubscriptions[1];
              expect(eventSubscription.campaign_cursor).toBe(campaignId);
              assertIso8601Like(eventSubscription.date_c);
              if (eventSubscription.event_type === 'consent_approved') {
                expect(eventSubscription.handler).toBe('OnConsentApproved');
              } else if (eventSubscription.event_type === 'data_declined') {
                expect(eventSubscription.handler).toBe('OnDataDeclined');
              } else {
                // This should not be called.
                expect(true).toBe(false);
              }
              assertIsCursorLike(eventSubscription.owner_cursor);

              done();
            });// eo it

          });// eo describe

          describe('using campaign ID and overriding config', () => {

            it('should fetch and return with the event subscriptions for the campaign', async (done) => {
              const defaultConfig = new Config({
                apiKey: 'should_be_unused',
                apiSecret: 'should_be_unused',
                apiUrlRoot: 'should_be_unused',
                campaignId: 'default-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
              });
              const overridingConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: 'overriding-campaign-id', // FIXME: TODO: Use other legit campaign cursors so we can make sure they are not being used.
              });
              const campaignId = await getCampaignId();

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
              const response = await systemSdk.listEventSubscriptions(campaignId, overridingConfig);
              expect(response).toBeInstanceOf(PagingResponse);
              expect(response.hasNextPage()).toBe(false);
              const nextPageResponse = await response.getNextPage();
              expect(nextPageResponse).toBe(null);
              const { result } = response;
              expect(result).toBeDefined();
              expect(result.page_info).toBeDefined();
              expect(result.page_info.end_cursor).toBe(null);
              expect(result.page_info.has_next_page).toBe(false);
              const eventSubscriptions = result.data;
              expect(eventSubscriptions).toBeInstanceOf(Array);
              expect(eventSubscriptions.length).toBe(2);
              let eventSubscription = eventSubscriptions[0];
              expect(eventSubscription.campaign_cursor).toBe(campaignId);
              assertIso8601Like(eventSubscription.date_c);
              if (eventSubscription.event_type === 'consent_approved') {
                expect(eventSubscription.handler).toBe('OnConsentApproved');
              } else if (eventSubscription.event_type === 'data_declined') {
                expect(eventSubscription.handler).toBe('OnDataDeclined');
              } else {
                // This should not be called.
                expect(true).toBe(false);
              }
              assertIsCursorLike(eventSubscription.owner_cursor);

              eventSubscription = eventSubscriptions[1];
              expect(eventSubscription.campaign_cursor).toBe(campaignId);
              assertIso8601Like(eventSubscription.date_c);
              if (eventSubscription.event_type === 'consent_approved') {
                expect(eventSubscription.handler).toBe('OnConsentApproved');
              } else if (eventSubscription.event_type === 'data_declined') {
                expect(eventSubscription.handler).toBe('OnDataDeclined');
              } else {
                // This should not be called.
                expect(true).toBe(false);
              }
              assertIsCursorLike(eventSubscription.owner_cursor);

              done();
            });// eo it

          });// eo describe

        });// eo describe

        describe('and unknown campaign ID', () => {

          describe('using default config', () => {

            it('should return an error response', async (done) => {
              const defaultConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: 'unknown',
              });

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

              try {
                await systemSdk.listEventSubscriptions();
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.listEventSubscriptions(null);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.listEventSubscriptions(null, { apiKey, apiSecret });
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              done();
            });// eo it

          });// eo describe

          describe('using overriding config', () => {

            it('should return an error response', async (done) => {
              const campaignId = await getCampaignId();
              const defaultConfig = new Config({
                apiKey: 'should_be_unused',
                apiSecret: 'should_be_unused',
                apiUrlRoot: 'should_be_unused',
                campaignId,
              });
              const overridingConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: 'unknown',
              });

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

              try {
                await systemSdk.listEventSubscriptions(null, overridingConfig);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              done();
            });// eo it

          });// eo describe

          describe('using campaign ID', () => {

            it('should return an error response', async (done) => {
              const campaignIdReal = await getCampaignId();
              const defaultConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: campaignIdReal,
              });
              const overridingConfig = new Config({
                apiKey,
                apiSecret,
                apiUrlRoot,
                campaignId: campaignIdReal,
              });
              const campaignId = 'unknown';

              const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);

              try {
                await systemSdk.listEventSubscriptions(campaignId);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              try {
                await systemSdk.listEventSubscriptions(campaignId, overridingConfig);
                // This should not be called.
                expect(true).toBe(false);
              } catch (response) {
                expect(response).toBeInstanceOf(ErrorResponse);
                const { error } = response;
                expect(error).toBeInstanceOf(XcooBeeError);
                expect(error.message).toBe('Wrong key at line: 3, column: 7');
                expect(error.name).toBe('XcooBeeError');
              }

              done();
            });// eo it

          });// eo describe

        });// eo describe

      });// eo describe

    });// eo describe('.listEventSubscriptions')

    describe('.ping', () => {

      describe('called with a valid API key/secret pair', () => {

        describe('using default config without a campaign ID', () => {

          it('should error out due to not resolving a campaign ID', async (done) => {
            const defaultConfig = new Config({
              apiKey,
              apiSecret,
              apiUrlRoot,
            });

            const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
            try {
              await systemSdk.ping();
              // This should not be called.
              expect(true).toBe(false);
            } catch (response) {
              expect(response).toBeInstanceOf(ErrorResponse);
              const { error } = response;
              expect(error).toBeInstanceOf(XcooBeeError);
              expect(error.message).toBe('Campaign ID is required');
              expect(error.name).toBe('XcooBeeError');
            }

            done();
          });// eo it

        });// eo describe

        describe('using default config with a valid campaign ID', () => {

          it('should be successful', async (done) => {
            const campaignId = await getCampaignId();
            const defaultConfig = new Config({
              apiKey,
              apiSecret,
              apiUrlRoot,
              campaignId,
            });

            const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
            const response = await systemSdk.ping();
            expect(response).toBeInstanceOf(SuccessResponse);
            const { result } = response;
            expect(result).toBe(true);

            done();
          });// eo it

        });// eo describe

        describe('using default config with an unknown campaign ID', () => {

          it('should error out due to not finding a campaign', async (done) => {
            const campaignId = 'unknown';
            const defaultConfig = new Config({
              apiKey,
              apiSecret,
              apiUrlRoot,
              campaignId,
            });

            const systemSdk = new System(defaultConfig, apiAccessTokenCache, usersCache);
            try {
              await systemSdk.ping();
              // This should not be called.
              expect(true).toBe(false);
            } catch (response) {
              expect(response).toBeInstanceOf(ErrorResponse);
              const { error } = response;
              expect(error).toBeInstanceOf(XcooBeeError);
              expect(error.message === 'Wrong key at line: 3, column: 7' || error.message === 'Campaign not found.').toBe(true);
              expect(error.name).toBe('XcooBeeError');
            }

            done();
          });// eo it

        });// eo describe

      });// eo describe

    });// eo describe('.ping')

  });// eo describe('instance')

});// eo describe('System')
