export default function WalletView() {
  return (
    <div className="dash-view-wrapper">
      {/* Page Header */}
      <div className="dash-page-intro">
        <p className="eyebrow">Funds & Payouts</p>
        <h1>Wallet</h1>
        <p className="intro-desc">
          Manage merchant balances, automatic daily payouts, and bank withdrawals.
        </p>
      </div>

      <div className="dash-panel-card">
        <div className="panel-card-head">
          <div>
            <h2>Settlement Overview</h2>
            <p>Your current revenue balance and destination payout account.</p>
          </div>
        </div>

        <div
          className="dash-tiles-row"
          style={{ marginTop: 10, marginBottom: 24 }}
        >
          <div className="metric-tile">
            <span className="tile-label">Available for Withdrawal</span>
            <strong className="tile-number">₦482,000</strong>
          </div>
          <div className="metric-tile">
            <span className="tile-label">Next Payout Schedule</span>
            <strong className="tile-number">Today, 6:00 PM</strong>
          </div>
          <div className="metric-tile">
            <span className="tile-label">Destination Account</span>
            <strong className="tile-number">GTBank · 0123456789</strong>
          </div>
        </div>

        <button
          type="button"
          className="header-btn-add"
          onClick={() =>
            alert(
              "Withdrawal request submitted! Funds will reflect in your account within 5 minutes."
            )
          }
        >
          Withdraw Funds to Bank
        </button>
      </div>
    </div>
  );
}
