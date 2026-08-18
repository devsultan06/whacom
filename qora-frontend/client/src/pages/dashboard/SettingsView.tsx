import {
  Check,
  CheckCircle2,
  CreditCard,
  Globe,
  MessageCircle,
  ShieldCheck,
  Store,
} from "lucide-react";

interface SettingsViewProps {
  storeName: string;
  setStoreName: (val: string) => void;
  botNumber: string;
  setBotNumber: (val: string) => void;
  bankName: string;
  setBankName: (val: string) => void;
  accountNumber: string;
  setAccountNumber: (val: string) => void;
  savedSettings: boolean;
  onSaveSettings: (e: React.FormEvent) => void;
}

export default function SettingsView({
  storeName,
  setStoreName,
  botNumber,
  setBotNumber,
  bankName,
  setBankName,
  accountNumber,
  setAccountNumber,
  savedSettings,
  onSaveSettings,
}: SettingsViewProps) {
  const cleanHandle = storeName
    ? storeName.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "sultan";

  return (
    <div className="dash-view-wrapper settings-full-view">
      {/* Page Header */}
      <div className="dash-page-intro">
        <p className="eyebrow">Store Configuration</p>
        <h1>Settings</h1>
        <p className="intro-desc">
          Manage your brand identity, WhatsApp bot connection, and settlement bank details.
        </p>
      </div>

      <form onSubmit={onSaveSettings} className="settings-rich-form">
        {/* SECTION 1: STORE IDENTITY */}
        <div className="dash-panel-card settings-section-card">
          <div className="section-card-title">
            <div className="section-icon-badge emerald">
              <Store size={18} />
            </div>
            <div>
              <h3>Store Identity & Public Link</h3>
              <p>Your store brand as shown to customers on WhatsApp and web.</p>
            </div>
          </div>

          <div className="settings-three-cols">
            <div className="settings-field">
              <label htmlFor="store-name-input">Store / Brand Name</label>
              <input
                id="store-name-input"
                type="text"
                className="settings-input"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="e.g. Sultan Store"
                required
              />
            </div>

            <div className="settings-field">
              <label>Storefront Public URL</label>
              <div className="settings-input-prefix-wrap">
                <span className="input-prefix">qora.store/</span>
                <input
                  type="text"
                  className="settings-input prefix-attached"
                  value={cleanHandle}
                  readOnly
                />
              </div>
            </div>

            <div className="settings-field">
              <label>Default Store Currency</label>
              <select className="settings-select" defaultValue="NGN">
                <option value="NGN">🇳🇬 Nigerian Naira (₦)</option>
                <option value="USD">🇺🇸 US Dollar ($)</option>
                <option value="GBP">🇬🇧 British Pound (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: WHATSAPP BOT CONFIGURATION */}
        <div className="dash-panel-card settings-section-card">
          <div className="section-card-title">
            <div className="section-icon-badge whatsapp">
              <MessageCircle size={18} />
            </div>
            <div>
              <h3>WhatsApp Commerce Bot</h3>
              <p>Configure the dedicated WhatsApp phone line connected to Qora.</p>
            </div>
            <span className="settings-live-tag">
              <span className="live-dot" /> Connected & Active
            </span>
          </div>

          <div className="settings-two-cols">
            <div className="settings-field">
              <label htmlFor="bot-phone-input">WhatsApp Business Number</label>
              <div className="settings-input-prefix-wrap">
                <span className="input-prefix">🇳🇬 +234</span>
                <input
                  id="bot-phone-input"
                  type="tel"
                  className="settings-input prefix-attached"
                  value={botNumber.replace("+234", "").trim()}
                  onChange={e => setBotNumber(`+234 ${e.target.value}`)}
                  placeholder="800 000 0000"
                  required
                />
              </div>
              <small className="field-hint">
                All order confirmations, voice note processing, and payments sync through this number.
              </small>
            </div>

            <div className="settings-field">
              <label>Automated Buyer Receipts</label>
              <div className="settings-toggle-row">
                <div>
                  <strong>Send Instant WhatsApp Receipt to Buyers</strong>
                  <p>Automatically sends order summary and receipt when bank transfer is verified.</p>
                </div>
                <input type="checkbox" defaultChecked className="settings-checkbox" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: BANK PAYOUT DETAILS */}
        <div className="dash-panel-card settings-section-card">
          <div className="section-card-title">
            <div className="section-icon-badge ink">
              <CreditCard size={18} />
            </div>
            <div>
              <h3>Bank Payout Account</h3>
              <p>Where daily revenue from confirmed sales is automatically settled.</p>
            </div>
            <span className="settings-secure-tag">
              <ShieldCheck size={14} /> 256-bit Encrypted
            </span>
          </div>

          <div className="settings-fields-grid">
            <div className="settings-two-cols">
              <div className="settings-field">
                <label htmlFor="bank-select">Settlement Bank</label>
                <select
                  id="bank-select"
                  className="settings-select"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  required
                >
                  <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="First Bank">First Bank of Nigeria</option>
                  <option value="United Bank for Africa">United Bank for Africa (UBA)</option>
                  <option value="Kuda Bank">Kuda Microfinance Bank</option>
                  <option value="Moniepoint">Moniepoint MFB</option>
                  <option value="OPay">OPay Digital Services</option>
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="acct-number-input">NUBAN Account Number (10 Digits)</label>
                <input
                  id="acct-number-input"
                  type="text"
                  maxLength={10}
                  className="settings-input font-mono"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="0123456789"
                  required
                />
              </div>
            </div>

            {accountNumber && (
              <div className="account-verified-pill">
                <Check size={14} className="text-emerald" />
                <span>
                  Verified Account Name: <b>SULTAN ADEWALE ENTERPRISES</b>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SAVE ACTIONS BAR */}
        <div className="settings-footer-bar">
          <button type="submit" className="header-btn-add settings-save-btn">
            Save Settings
          </button>
          {savedSettings && (
            <span className="save-success">
              <CheckCircle2 size={16} /> Changes saved and synced to WhatsApp bot!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
