const BASE_EXPERT_PROMPT = `You are a world-class quantitative trading expert with experience at top firms like Goldman Sachs, JP Morgan, Citadel, BlackRock, Two Sigma, Virtu Financial, Morgan Stanley, Renaissance Technologies, and AQR Capital. I need a comprehensive quantitative trading model and strategy for the following specialized area. Provide the analysis of the trading model and strategy. Do not include any code, including Python pseudocode. Focus on the quantitative insights, performance expectations, and backtesting frameworks.`;

export const REPORT_SECTIONS = [
  {
    title: "Time Series Forecasting Model",
    prompt: `1. Time Series Forecasting Model for [STOCK/ASSET]\n   - Data preprocessing: How to clean price data and handle missing values\n   - Feature engineering: Technical indicators (moving averages, RSI, MACD, Bollinger Bands)\n   - Model selection: Compare ARIMA, LSTM neural networks, and Prophet models\n   - Training approach: Train-test split ratios and cross-validation strategy\n   - Performance metrics: MAE, RMSE, directional accuracy for predictions\n   - Backtesting framework: How to test strategy on historical data\n   - Risk management: Stop-loss rules and position sizing based on confidence\n   - Asset: [TICKER], daily data from 2010-2026, data source: Yahoo Finance API`,
  },
  {
    title: "Mean Reversion Trading Strategy",
    prompt: `2. Mean Reversion Trading Strategy for [MARKET/ASSET]\n   - Statistical foundation: Z-score calculation and standard deviation bands\n   - Entry signals: When price deviates X standard deviations from mean\n   - Exit signals: When price returns to mean or stop-loss triggers\n   - Pair selection: How to find correlated assets for pairs trading\n   - Cointegration testing: Statistical tests to validate pair relationships\n   - Position sizing: Kelly Criterion or fixed-fraction approach\n   - Risk parameters: Maximum drawdown limits and exposure caps\n   - Backtesting results: Expected Sharpe ratio and win rate over 3+ years`,
  },
  {
    title: "Sentiment Analysis Trading Model",
    prompt: `3. Sentiment Analysis Trading Model for [STOCKS/SECTOR]\n   - Data sources: Twitter, Reddit, news APIs, earnings call transcripts\n   - Sentiment scoring: How to rate text as bullish/neutral/bearish (-1 to +1 scale)\n   - NLP preprocessing: Tokenization, stop word removal, entity recognition\n   - Model architecture: BERT, FinBERT, or custom transformer for financial text\n   - Signal generation: How sentiment changes trigger buy/sell decisions\n   - Volume weighting: Adjusting for tweet/article volume and source credibility\n   - Lag analysis: Time delay between sentiment spike and price movement\n   - Performance tracking: Correlation between sentiment and actual returns`,
  },
  {
    title: "Portfolio Optimization Algorithm",
    prompt: `4. Portfolio Optimization Algorithm for [ASSET UNIVERSE]\n   - Modern Portfolio Theory: Efficient frontier calculation with mean-variance optimization\n   - Sharpe ratio maximization: Finding optimal risk-adjusted return portfolio\n   - Constraints definition: Sector limits, individual position caps, liquidity requirements\n   - Covariance matrix: How assets move together (correlation and volatility)\n   - Rebalancing rules: When and how much to adjust positions\n   - Transaction costs: Incorporating trading fees and slippage into optimization\n   - Risk budgeting: Allocating risk across assets based on contribution to portfolio variance\n   - Scenario testing: How portfolio performs in market crash, rally, or sideways conditions`,
  },
  {
    title: "Machine Learning Feature Selection",
    prompt: `5. Machine Learning Feature Selection for [TRADING STRATEGY]\n   - Raw features: Price, volume, volatility, bid-ask spread, market depth\n   - Derived features: Returns, log returns, rolling statistics, momentum indicators\n   - Alternative data: Satellite imagery, web traffic, credit card transactions\n   - Feature importance: Which variables actually predict price movements\n   - Dimensionality reduction: PCA or factor models to reduce feature count\n   - Feature correlation: Removing redundant features that don't add information\n   - Forward-looking bias: Ensuring no data leakage from future into training\n   - Feature stability: Which features remain predictive across different market regimes`,
  },
  {
    title: "High-Frequency Trading Signal Detection",
    prompt: `6. High-Frequency Trading Signal Detection for [LIQUID ASSETS]\n   - Order book analysis: Bid-ask spread, depth imbalance, order flow toxicity\n   - Tick data processing: How to handle millisecond-level price updates\n   - Signal triggers: Imbalances, large orders, quote stuffing detection\n   - Execution logic: Market orders vs. limit orders vs. hidden orders\n   - Latency requirements: Infrastructure needs for sub-10ms execution\n   - Slippage estimation: Expected cost of trading at different sizes\n   - Market impact: How your orders move the price and how to minimize it\n   - Profitability calculation: Edge per trade minus costs (commissions, exchange fees)`,
  },
  {
    title: "Risk Management & VaR Model",
    prompt: `7. Risk Management & VaR Model for [PORTFOLIO/STRATEGY]\n   - VaR calculation: Historical simulation, parametric, or Monte Carlo approach\n   - Confidence level: 95% or 99% probability of maximum loss\n   - Time horizon: Daily, weekly, or monthly VaR estimation\n   - Stress testing: How portfolio performs in 2008 crisis, COVID crash scenarios\n   - Expected Shortfall: Average loss when VaR threshold is breached\n   - Greeks calculation: Delta, gamma, vega for options portfolios\n   - Correlation breakdown: How individual positions contribute to total risk\n   - Risk limits: Position limits, leverage caps, concentration restrictions`,
  },
  {
    title: "Options Pricing & Greeks Model",
    prompt: `8. Options Pricing & Greeks Model for [UNDERLYING ASSET]\n   - Black-Scholes model: Theoretical price calculation with assumptions\n   - Implied volatility: Extracting market's volatility expectation from option prices\n   - Greeks computation: Delta, gamma, theta, vega, rho for risk management\n   - Volatility smile: How implied vol changes across strike prices\n   - Delta hedging: How many shares to hold to be market-neutral\n   - Gamma scalping: Profiting from volatility through dynamic hedging\n   - Option strategies: Spreads, strangles, iron condors with P&L profiles\n   - Scenario analysis: How position performs if stock moves ±5%, ±10%`,
  },
  {
    title: "Pairs Trading Cointegration Model",
    prompt: `9. Pairs Trading Cointegration Model for [CORRELATED ASSETS]\n   - Pair selection: Finding stocks that move together historically\n   - Cointegration test: Augmented Dickey-Fuller test for statistical relationship\n   - Spread calculation: Price difference or ratio between the two assets\n   - Z-score threshold: Entry when spread is 2+ standard deviations from mean\n   - Mean reversion speed: Half-life of spread returning to equilibrium\n   - Position sizing: Dollar-neutral or beta-neutral pair construction\n   - Exit rules: Close position when spread returns to mean or hits stop-loss\n   - Risk monitoring: What if cointegration breaks down during holding period`,
  },
  {
    title: "Machine Learning Backtesting Framework",
    prompt: `10. Machine Learning Backtesting Framework for [TRADING STRATEGY]\n    - Data pipeline: Historical price data ingestion and storage\n    - Signal generation: How strategy produces buy/sell/hold decisions\n    - Transaction simulation: Market orders, limit orders, realistic fill assumptions\n    - Cost modeling: Commissions, slippage, market impact, borrowing costs\n    - Performance metrics: Sharpe ratio, max drawdown, win rate, profit factor\n    - Overfitting detection: Walk-forward testing, out-of-sample validation\n    - Regime analysis: How strategy performs in bull, bear, sideways markets\n    - Production readiness: Code structure, error handling, monitoring dashboards`,
  },
  {
    title: "Reinforcement Learning Trading Agent",
    prompt: `11. Reinforcement Learning Trading Agent for [TRADING TASK]\n    - Environment setup: State space (prices, positions, cash), action space (buy/sell/hold)\n    - Reward function: Profit minus transaction costs minus risk penalty\n    - RL algorithm: Deep Q-Learning, PPO, or Actor-Critic approach\n    - Neural network architecture: Input layers, hidden layers, output layer specifications\n    - Training approach: Episodes, experience replay, exploration vs. exploitation\n    - Hyperparameter tuning: Learning rate, discount factor, batch size optimization\n    - Performance benchmarks: Compare to buy-and-hold and simple moving average strategies\n    - Risk constraints: Maximum position size, drawdown limits built into reward`,
  },
  {
    title: "Factor Investing Model",
    prompt: `12. Factor Investing Model for [EQUITY UNIVERSE]\n    - Factor definitions: Value (P/E, P/B), momentum (12-month return), quality (ROE, debt ratio)\n    - Factor scoring: Ranking stocks within universe on each factor\n    - Weight calculation: Combining multiple factors into single composite score\n    - Portfolio construction: Long top quintile, short bottom quintile for each factor\n    - Rebalancing frequency: Monthly, quarterly, or annual turnover\n    - Capacity analysis: How much capital can strategy absorb before returns degrade\n    - Factor timing: When to overweight/underweight certain factors\n    - Attribution analysis: Which factors drove returns in each period`,
  },
];

const INDUSTRY_SPECIFICS = {
  Health: {
    2: "   - Market: Pharmaceutical stocks, daily timeframe, swing trading style",
    3: "   - Sector: Healthcare stocks; sentiment sources: FDA news, clinical trial updates; target returns: 15% annualized",
    4: "   - Portfolio: Healthcare equities, moderate risk tolerance, max 20% per stock constraint",
    5: "   - Strategy: Momentum trading in biotech stocks, predicting next-day returns, data: historical prices and clinical trial databases",
    6: "   - Assets: Liquid healthcare ETFs like XLV, NYSE exchange, intraday holding period",
    7: "   - Portfolio: Diversified health stocks, 2x leverage, conservative risk appetite",
    8: "   - Underlying: [TICKER], call options, 3-month expiration",
    9: "   - Pairs: [TICKER] and a primary competitor, healthcare sector, supply chain relationship",
    10: "   - Strategy: Event-driven trading on FDA approvals, US healthcare universe, weekly frequency",
    11: "   - Task: Trading biotech stocks, goal: Maximize returns during pandemic events, training data: 2015-2026",
    12: "   - Universe: Global healthcare equities, factors: Innovation (R&D spend), target return: 12% annualized",
  },
  Car: {
    2: "   - Market: Automotive stocks, daily timeframe, swing trading style",
    3: "   - Sector: Automotive stocks; sentiment sources: EV news, supply chain updates; target returns: 20% annualized",
    4: "   - Portfolio: Automotive equities, aggressive risk tolerance, max 25% per stock constraint",
    5: "   - Strategy: Trend-following in EV stocks, predicting quarterly returns, data: historical prices and production metrics",
    6: "   - Assets: Liquid automotive stocks like TSLA, NASDAQ exchange, intraday holding period",
    7: "   - Portfolio: Diversified car stocks, 3x leverage, moderate risk appetite",
    8: "   - Underlying: [TICKER], put options, 6-month expiration",
    9: "   - Pairs: [TICKER] and a primary EV/Auto competitor, automotive sector, market share relationship",
    10: "   - Strategy: Volatility breakout on car earnings, global automotive universe, daily frequency",
    11: "   - Task: Trading EV stocks, goal: Optimize during supply chain disruptions, training data: 2018-2026",
    12: "   - Universe: Global automotive equities, factors: Growth (EV adoption), target return: 18% annualized",
  },
  Tech: {
    2: "   - Market: Technology stocks, daily timeframe, swing trading style",
    3: "   - Sector: Technology stocks; sentiment sources: Product launches, developer forums, regulatory news; target returns: 25% annualized",
    4: "   - Portfolio: Tech equities, aggressive risk tolerance, max 30% per stock constraint",
    5: "   - Strategy: Momentum trading in SaaS/Cloud stocks, predicting next-day returns",
    6: "   - Assets: Liquid tech stocks like NVDA, AAPL, NASDAQ exchange, intraday holding period",
    7: "   - Portfolio: Diversified tech stocks, 2.5x leverage, moderate risk appetite",
    8: "   - Underlying: [TICKER], call options, 1-month expiration",
    9: "   - Pairs: [TICKER] and a primary tech competitor, tech sector, ecosystem relationship",
    10: "   - Strategy: Earnings surprise trading, US tech universe, daily frequency",
    11: "   - Task: Trading high-growth tech stocks, goal: Maximize risk-adjusted returns",
    12: "   - Universe: Global technology equities, factors: Growth (R&D intensity), target return: 20% annualized",
  },
};

export function getIndustryPrompts(industry: keyof typeof INDUSTRY_SPECIFICS | 'Other') {
  if (industry === 'Other') {
    industry = 'Tech'; // Fallback to Tech for 'Other'
  }
  const specifics = INDUSTRY_SPECIFICS[industry];

  return REPORT_SECTIONS.map((section, index) => {
    const sectionNumber = index + 1;
    const industrySpecificLine = specifics[sectionNumber as keyof typeof specifics];
    const finalPrompt = `${BASE_EXPERT_PROMPT}\n\n${section.prompt}${industrySpecificLine ? `\n${industrySpecificLine}` : ''}`;
    return {
      title: section.title,
      prompt: finalPrompt,
    };
  });
}

