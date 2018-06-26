const { spy, match: { string }, assert } = require('sinon');
const base64url = require('base64url');
const { expect } = require('chai');

const { formats: { default: FORMAT } } = require('../../lib/helpers/defaults');
const epochTime = require('../../lib/helpers/epoch_time');
const bootstrap = require('../test_helper');

function decode(b64urljson) {
  return JSON.parse(base64url.decode(b64urljson));
}

if (FORMAT === 'legacy') {
  describe('legacy storage', () => {
    before(bootstrap(__dirname));
    const accountId = 'account';
    const claims = {};
    const clientId = 'client';
    const grantId = 'grantid';
    const scope = 'openid';
    const sid = 'sid';
    const consumed = true;
    const acr = 'acr';
    const amr = ['amr'];
    const authTime = epochTime();
    const nonce = 'nonce';
    const redirectUri = 'https://rp.example.com/cb';
    const codeChallenge = 'codeChallenge';
    const codeChallengeMethod = 'codeChallengeMethod';
    const aud = [clientId, 'foo'];

    /* eslint-disable object-property-newline */
    const fullPayload = {
      accountId, claims, clientId, grantId, scope, sid, consumed, acr, amr, authTime, nonce,
      redirectUri, codeChallenge, codeChallengeMethod, aud,
    };
    /* eslint-enable object-property-newline */

    afterEach(function () {
      [
        'AuthorizationCode', 'AccessToken', 'RefreshToken', 'ClientCredentials', 'InitialAccessToken', 'RegistrationAccessToken',
      ].forEach((model) => {
        if (this.TestAdapter.for(model).upsert.restore) {
          this.TestAdapter.for(model).upsert.restore();
        }
      });
    });

    it('for AccessToken', async function () {
      const kind = 'AccessToken';
      const upsert = spy(this.TestAdapter.for('AccessToken'), 'upsert');
      const token = new this.provider.AccessToken(fullPayload);
      await token.save();

      assert.calledWith(upsert, string, {
        grantId,
        header: string,
        payload: string,
        signature: string,
      });

      const { iat, exp, ...payload } = decode(upsert.getCall(0).args[1].payload);
      expect(iat).to.be.a('number');
      expect(exp).to.be.a('number');
      expect(payload).to.eql({
        accountId,
        claims,
        clientId,
        aud,
        grantId,
        scope,
        sid,
        kind,
        iss: this.provider.issuer,
        jti: upsert.getCall(0).args[0],
      });
    });

    it('for AuthorizationCode', async function () {
      const kind = 'AuthorizationCode';
      const upsert = spy(this.TestAdapter.for('AuthorizationCode'), 'upsert');
      const token = new this.provider.AuthorizationCode(fullPayload);
      await token.save();

      assert.calledWith(upsert, string, {
        grantId,
        consumed,
        header: string,
        payload: string,
        signature: string,
      });

      const { iat, exp, ...payload } = decode(upsert.getCall(0).args[1].payload);
      expect(iat).to.be.a('number');
      expect(exp).to.be.a('number');
      expect(payload).to.eql({
        acr,
        codeChallenge,
        codeChallengeMethod,
        amr,
        authTime,
        accountId,
        claims,
        clientId,
        grantId,
        scope,
        nonce,
        redirectUri,
        sid,
        kind,
        iss: this.provider.issuer,
        jti: upsert.getCall(0).args[0],
      });
    });

    it('for RefreshToken', async function () {
      const kind = 'RefreshToken';
      const upsert = spy(this.TestAdapter.for('RefreshToken'), 'upsert');
      const token = new this.provider.RefreshToken(fullPayload);
      await token.save();

      assert.calledWith(upsert, string, {
        grantId,
        consumed,
        header: string,
        payload: string,
        signature: string,
      });

      const { iat, exp, ...payload } = decode(upsert.getCall(0).args[1].payload);
      expect(iat).to.be.a('number');
      expect(exp).to.be.a('number');
      expect(payload).to.eql({
        accountId,
        acr,
        amr,
        authTime,
        claims,
        clientId,
        grantId,
        nonce,
        scope,
        sid,
        kind,
        iss: this.provider.issuer,
        jti: upsert.getCall(0).args[0],
      });
    });

    it('for ClientCredentials', async function () {
      const kind = 'ClientCredentials';
      const upsert = spy(this.TestAdapter.for('ClientCredentials'), 'upsert');
      const token = new this.provider.ClientCredentials(fullPayload);
      await token.save();

      assert.calledWith(upsert, string, {
        header: string,
        payload: string,
        signature: string,
      });

      const { iat, exp, ...payload } = decode(upsert.getCall(0).args[1].payload);
      expect(iat).to.be.a('number');
      expect(exp).to.be.a('number');
      expect(payload).to.eql({
        clientId,
        scope,
        aud,
        kind,
        iss: this.provider.issuer,
        jti: upsert.getCall(0).args[0],
      });
    });

    it('for InitialAccessToken', async function () {
      const kind = 'InitialAccessToken';
      const upsert = spy(this.TestAdapter.for('InitialAccessToken'), 'upsert');
      const token = new this.provider.InitialAccessToken({
        expiresIn: 100,
        ...fullPayload,
      });
      await token.save();

      assert.calledWith(upsert, string, {
        header: string,
        payload: string,
        signature: string,
      });

      const { iat, exp, ...payload } = decode(upsert.getCall(0).args[1].payload);
      expect(iat).to.be.a('number');
      expect(exp).to.be.a('number');
      expect(payload).to.eql({
        kind,
        iss: this.provider.issuer,
        jti: upsert.getCall(0).args[0],
      });
    });

    it('for RegistrationAccessToken', async function () {
      const kind = 'RegistrationAccessToken';
      const upsert = spy(this.TestAdapter.for('RegistrationAccessToken'), 'upsert');
      const token = new this.provider.RegistrationAccessToken({
        expiresIn: 100,
        ...fullPayload,
      });
      await token.save();

      assert.calledWith(upsert, string, {
        header: string,
        payload: string,
        signature: string,
      });

      const { iat, exp, ...payload } = decode(upsert.getCall(0).args[1].payload);
      expect(iat).to.be.a('number');
      expect(exp).to.be.a('number');
      expect(payload).to.eql({
        clientId,
        kind,
        iss: this.provider.issuer,
        jti: upsert.getCall(0).args[0],
      });
    });
  });
}
