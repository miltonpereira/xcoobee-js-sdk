const ApiAccessTokenCache = require('../../../../../src/xcoobee/api/ApiAccessTokenCache');
const InboxApi = require('../../../../../src/xcoobee/api/InboxApi');
const UsersCache = require('../../../../../src/xcoobee/api/UsersCache');

const { assertIso8601Like } = require('../../../../lib/Utils');

const apiUrlRoot = process.env.XCOOBEE__API_URL_ROOT || 'https://testapi.xcoobee.net/Test';
const apiKey = process.env.XCOOBEE__API_KEY;
const apiSecret = process.env.XCOOBEE__API_SECRET;

jest.setTimeout(60000);

describe('InboxApi', () => {

  const apiAccessTokenCache = new ApiAccessTokenCache();
  const usersCache = new UsersCache(apiAccessTokenCache);

  describe('.deleteInboxItem', () => {

    describe('called with a valid API access token', () => {

      describe('and a valid user cursor', () => {

        describe('but with an unknown message ID', () => {

          it('should return with a null transaction ID', async (done) => {
            const apiAccessToken = await apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
            const user = await usersCache.get(apiUrlRoot, apiKey, apiSecret);
            const userCursor = user.cursor;
            const messageId = 'unknown';
            const result = await InboxApi.deleteInboxItem(apiUrlRoot, apiAccessToken, userCursor, messageId);
            expect(result).toBe(true);
            done();
          });// eo it

        });// eo describe

        // TODO: Test with a known message ID.
      });// eo describe

    });// eo describe

  });// eo describe('.deleteInboxItem')

  describe('.getInboxItem', () => {

    describe('called with a valid API access token', () => {

      xit('should fetch and return the inbox item', async (done) => {
        const apiAccessToken = await apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
        const user = await usersCache.get(apiUrlRoot, apiKey, apiSecret);
        const userCursor = user.cursor;
        const messageId = 'ico-lock-64x64.png.f02cde11-85d5-42bf-be53-e1e930a4a52b'; // FIXME: TODO: Get a legit message ID.
        const result = await InboxApi.getInboxItem(apiUrlRoot, apiAccessToken, userCursor, messageId);
        expect(result).toBeDefined();
        expect(result.inbox_item).toBeDefined();
        const { inbox_item } = result;
        expect(inbox_item.download_link).toMatch('ico-lock-64x64.png');
        expect(inbox_item.info).toBeDefined();
        expect(inbox_item.info.file_tags).toEqual([]);
        expect(inbox_item.info.file_type).toBe(1015);
        expect(inbox_item.info.user_ref).toBe('243f0e2c-8b8a-11e8-8e3e-cb82c9b75eed');
        // TODO: Add more expectations.
        done();
      });// eo it

    });// eo describe

  });// eo describe('.getInboxItem')

  // FIXME: TODO: Get Inbox to a known state with at least one item to search for.
  xdescribe('.listInbox', () => {

    describe('called with a valid API access token', () => {

      describe('and called with no starting message ID', () => {

        it('should fetch and return with a list of inbox items', async (done) => {
          const apiAccessToken = await apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
          const result = await InboxApi.listInbox(apiUrlRoot, apiAccessToken);
          expect(result).toBeDefined();
          expect(result.data).toBeInstanceOf(Array);
          expect(result.page_info).toBeDefined();
          expect(result.page_info.end_cursor).toBe('tJnf+3ZKrQCKYIMpUKUt236I1xDa2E91la7vYPr8qwL+GwitmaI++y/6SxDeXFLiq2segVucQxy51tdENjtf7d0BRFnjB5tyNXE5yMPPVaY=');
          expect(result.page_info.has_next_page).toBeNull();
          const inboxItems = result.data;
          // Not yet sure if this will always be the case, but it is right now.
          expect(inboxItems.length).toBe(1);
          const inboxItem = inboxItems[0];
          expect(inboxItem.fileName).toBe('ico-lock-64x64.png');
          expect(inboxItem.messageId).toBe('ico-lock-64x64.png.f02cde11-85d5-42bf-be53-e1e930a4a52b');
          expect(inboxItem.fileSize).toBe(2628);
          expect(inboxItem.sender).toBeDefined();
          expect(inboxItem.sender.from).toBe('MBDYlKvqerX4iam4BOi9k+VsRAPB9Bd7n1h+5ehEE+WDZSm+xRtmklTO8bWazyztrkis4w==');
          expect(inboxItem.sender.from_xcoobee_id).toBe('~SDKTester_Developer');
          expect(inboxItem.sender.name).toBe('SDK Tester');
          expect(inboxItem.sender.validation_score).toBe(1);
          assertIso8601Like(inboxItem.receiptDate);
          assertIso8601Like(inboxItem.downloadDate);
          assertIso8601Like(inboxItem.expirationDate);
          done();
        });// eo it

      });// eo describe

      describe('and called with a starting message ID', () => {

        it('should fetch and return with a list of inbox items', async (done) => {
          const apiAccessToken = await apiAccessTokenCache.get(apiUrlRoot, apiKey, apiSecret);
          const startId = 'tJnf+3ZKrQCKYIMpUKUt236I1xDa2E91la7vYPr8qwL+GwitmaI++y/6SxDeXFLiq2segVucQxy51tdENjtf7d0BRFnjB5tyNXE5yMPPVaY=';
          const result = await InboxApi.listInbox(apiUrlRoot, apiAccessToken, startId);
          expect(result).toBeDefined();
          expect(result.data).toBeInstanceOf(Array);
          expect(result.page_info).toBeDefined();
          expect(result.page_info.end_cursor).toBeNull();
          expect(result.page_info.has_next_page).toBeNull();
          const inboxItems = result.data;
          expect(inboxItems.length).toBe(0);
          done();
        });// eo it

      });// eo describe

    });// eo describe

  });// eo describe('.listInbox')

});// eo describe('InboxApi')
