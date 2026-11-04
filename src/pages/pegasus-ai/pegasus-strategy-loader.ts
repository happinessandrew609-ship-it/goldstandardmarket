/**
 * Pegasus Strategy Generator & Blockly Workspace Injector
 * Generates exact Pegasus algorithmic strategies matching reference video specifications.
 */

import { IPegasusSignal, TPegasusTradeType } from './pegasus-scanner-service';
export { IPegasusSignal, TPegasusTradeType };

export interface IPegasusStrategyOptions {
    symbol: string;
    stake: number;
    takeProfit: number;
    stopLoss?: number;
    tradeType?: TPegasusTradeType;
    barrier?: number;
    martingaleMultiplier?: number;
    maxLossStreak?: number;
    durationTicks?: number;
}

export const generatePegasusXml = (options: IPegasusStrategyOptions): string => {
    const {
        symbol,
        stake,
        takeProfit,
        stopLoss = 1000,
        tradeType = 'DIGITOVER',
        barrier = 2,
        martingaleMultiplier = 2.0,
        maxLossStreak = 5,
        durationTicks = 1,
    } = options;

    let tradeTypeCat = 'digits';
    let tradeTypeList = 'overunder';
    let hasPrediction = true;
    let purchaseType = 'DIGITOVER';

    switch (tradeType) {
        case 'DIGITOVER':
            tradeTypeCat = 'digits';
            tradeTypeList = 'overunder';
            hasPrediction = true;
            purchaseType = 'DIGITOVER';
            break;
        case 'DIGITUNDER':
            tradeTypeCat = 'digits';
            tradeTypeList = 'overunder';
            hasPrediction = true;
            purchaseType = 'DIGITUNDER';
            break;
        case 'DIGITEVEN':
            tradeTypeCat = 'digits';
            tradeTypeList = 'evenodd';
            hasPrediction = false;
            purchaseType = 'DIGITEVEN';
            break;
        case 'DIGITODD':
            tradeTypeCat = 'digits';
            tradeTypeList = 'evenodd';
            hasPrediction = false;
            purchaseType = 'DIGITODD';
            break;
        case 'DIGITDIFF':
            tradeTypeCat = 'digits';
            tradeTypeList = 'matchesdiffers';
            hasPrediction = true;
            purchaseType = 'DIGITDIFF';
            break;
        case 'DIGITMATCH':
            tradeTypeCat = 'digits';
            tradeTypeList = 'matchesdiffers';
            hasPrediction = true;
            purchaseType = 'DIGITMATCH';
            break;
        default:
            tradeTypeCat = 'digits';
            tradeTypeList = 'overunder';
            hasPrediction = true;
            purchaseType = 'DIGITOVER';
    }

    const predictionMutation = hasPrediction
        ? `<mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="true"></mutation>`
        : `<mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="false"></mutation>`;

    const predictionValueBlock = hasPrediction
        ? `<value name="PREDICTION">
          <shadow type="math_number" id="pred_val">
            <field name="NUM">${barrier}</field>
          </shadow>
        </value>`
        : '';

    return `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false" data-strategy-origin="pegasus" data-strategy-name="Pegasus AI Engine">
  <variables>
    <variable id="pegasus_initial_stake">pegasus-initial-stake</variable>
    <variable id="pegasus_current_stake">pegasus-current-stake</variable>
    <variable id="pegasus_active_barrier">pegasus-active-barrier</variable>
    <variable id="pegasus_martingale_step">pegasus-martingale-step</variable>
    <variable id="pegasus_maximum_steps">pegasus-maximum-steps</variable>
    <variable id="pegasus_profit">pegasus-profit</variable>
    <variable id="pegasus_session_profit">pegasus-session-profit</variable>
    <variable id="pegasus_completed_contracts">pegasus-completed-contracts</variable>
    <variable id="pegasus_take_profit">pegasus-take-profit</variable>
    <variable id="pegasus_loss_threshold">pegasus-loss-threshold</variable>
    <variable id="pegasus_mart_multiplier">pegasus-martingale-multiplier</variable>
  </variables>
  <block type="trade_definition" id="pegasus_trade_def" deletable="false" x="0" y="110">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="pegasus_market" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">${symbol}</field>
        <next>
          <block type="trade_definition_tradetype" id="pegasus_tradetype" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">${tradeTypeCat}</field>
            <field name="TRADETYPE_LIST">${tradeTypeList}</field>
            <next>
              <block type="trade_definition_contracttype" id="pegasus_contracttype" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="pegasus_candleinterval" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="pegasus_restartbuysell" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="pegasus_restartonerror" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="INITIALIZATION">
      <block type="variables_set" id="init_initial_stake">
        <field name="VAR" id="pegasus_initial_stake">pegasus-initial-stake</field>
        <value name="VALUE">
          <block type="math_number" id="num_stake">
            <field name="NUM">${stake}</field>
          </block>
        </value>
        <next>
          <block type="variables_set" id="init_current_stake">
            <field name="VAR" id="pegasus_current_stake">pegasus-current-stake</field>
            <value name="VALUE">
              <block type="math_number" id="num_curr_stake">
                <field name="NUM">${stake}</field>
              </block>
            </value>
            <next>
              <block type="variables_set" id="init_barrier">
                <field name="VAR" id="pegasus_active_barrier">pegasus-active-barrier</field>
                <value name="VALUE">
                  <block type="math_number" id="num_barrier">
                    <field name="NUM">${barrier}</field>
                  </block>
                </value>
                <next>
                  <block type="variables_set" id="init_step">
                    <field name="VAR" id="pegasus_martingale_step">pegasus-martingale-step</field>
                    <value name="VALUE">
                      <block type="math_number" id="num_step_zero">
                        <field name="NUM">0</field>
                      </block>
                    </value>
                    <next>
                      <block type="variables_set" id="init_max_steps">
                        <field name="VAR" id="pegasus_maximum_steps">pegasus-maximum-steps</field>
                        <value name="VALUE">
                          <block type="math_number" id="num_max_steps">
                            <field name="NUM">${maxLossStreak}</field>
                          </block>
                        </value>
                        <next>
                          <block type="variables_set" id="init_profit">
                            <field name="VAR" id="pegasus_profit">pegasus-profit</field>
                            <value name="VALUE">
                              <block type="math_number" id="num_profit_zero">
                                <field name="NUM">0</field>
                              </block>
                            </value>
                            <next>
                              <block type="variables_set" id="init_session_profit">
                                <field name="VAR" id="pegasus_session_profit">pegasus-session-profit</field>
                                <value name="VALUE">
                                  <block type="math_number" id="num_sess_zero">
                                    <field name="NUM">0</field>
                                  </block>
                                </value>
                                <next>
                                  <block type="variables_set" id="init_completed">
                                    <field name="VAR" id="pegasus_completed_contracts">pegasus-completed-contracts</field>
                                    <value name="VALUE">
                                      <block type="math_number" id="num_comp_zero">
                                        <field name="NUM">0</field>
                                      </block>
                                    </value>
                                    <next>
                                      <block type="variables_set" id="init_tp">
                                        <field name="VAR" id="pegasus_take_profit">pegasus-take-profit</field>
                                        <value name="VALUE">
                                          <block type="math_number" id="num_tp">
                                            <field name="NUM">${takeProfit}</field>
                                          </block>
                                        </value>
                                        <next>
                                          <block type="variables_set" id="init_loss_thresh">
                                            <field name="VAR" id="pegasus_loss_threshold">pegasus-loss-threshold</field>
                                            <value name="VALUE">
                                              <block type="math_number" id="num_loss_thresh">
                                                <field name="NUM">${stopLoss}</field>
                                              </block>
                                            </value>
                                            <next>
                                              <block type="variables_set" id="init_mart_mult">
                                                <field name="VAR" id="pegasus_mart_multiplier">pegasus-martingale-multiplier</field>
                                                <value name="VALUE">
                                                  <block type="math_number" id="num_mart_mult">
                                                    <field name="NUM">${martingaleMultiplier}</field>
                                                  </block>
                                                </value>
                                              </block>
                                            </next>
                                          </block>
                                        </next>
                                      </block>
                                    </next>
                                  </block>
                                </next>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="pegasus_options">
        ${predictionMutation}
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number" id="dur_val">
            <field name="NUM">${durationTicks}</field>
          </shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number" id="amt_val">
            <field name="NUM">${stake}</field>
          </shadow>
          <block type="variables_get" id="get_curr_stake">
            <field name="VAR" id="pegasus_current_stake">pegasus-current-stake</field>
          </block>
        </value>
        ${predictionValueBlock}
      </block>
    </statement>
  </block>
  <block type="before_purchase" id="pegasus_before_purchase" deletable="false" x="0" y="720">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="purchase" id="pegasus_purchase_action">
        <field name="PURCHASE_LIST">${purchaseType}</field>
      </block>
    </statement>
  </block>
  <block type="after_purchase" id="pegasus_after_purchase" deletable="false" x="0" y="880">
    <statement name="AFTERPURCHASE_STACK">
      <block type="controls_if" id="pegasus_check_result">
        <mutation xmlns="http://www.w3.org/1999/xhtml" else="1"></mutation>
        <value name="IF0">
          <block type="contract_check_result" id="pegasus_win_check">
            <field name="CHECK_RESULT">win</field>
          </block>
        </value>
        <statement name="DO0">
          <block type="variables_set" id="reset_stake_win">
            <field name="VAR" id="pegasus_current_stake">pegasus-current-stake</field>
            <value name="VALUE">
              <block type="variables_get" id="get_initial_stake">
                <field name="VAR" id="pegasus_initial_stake">pegasus-initial-stake</field>
              </block>
            </value>
            <next>
              <block type="variables_set" id="reset_mart_step">
                <field name="VAR" id="pegasus_martingale_step">pegasus-martingale-step</field>
                <value name="VALUE">
                  <block type="math_number" id="num_zero_step">
                    <field name="NUM">0</field>
                  </block>
                </value>
              </block>
            </next>
          </block>
        </statement>
        <statement name="ELSE">
          <block type="variables_set" id="incr_mart_step">
            <field name="VAR" id="pegasus_martingale_step">pegasus-martingale-step</field>
            <value name="VALUE">
              <block type="math_arithmetic" id="math_add_step">
                <field name="OP">ADD</field>
                <value name="A">
                  <block type="variables_get" id="get_curr_step">
                    <field name="VAR" id="pegasus_martingale_step">pegasus-martingale-step</field>
                  </block>
                </value>
                <value name="B">
                  <block type="math_number" id="num_one_step">
                    <field name="NUM">1</field>
                  </block>
                </value>
              </block>
            </value>
            <next>
              <block type="controls_if" id="check_circuit_breaker">
                <mutation xmlns="http://www.w3.org/1999/xhtml" else="1"></mutation>
                <value name="IF0">
                  <block type="logic_compare" id="compare_consec_max">
                    <field name="OP">GTE</field>
                    <value name="A">
                      <block type="variables_get" id="get_cur_step">
                        <field name="VAR" id="pegasus_martingale_step">pegasus-martingale-step</field>
                      </block>
                    </value>
                    <value name="B">
                      <block type="variables_get" id="get_max_steps">
                        <field name="VAR" id="pegasus_maximum_steps">pegasus-maximum-steps</field>
                      </block>
                    </value>
                  </block>
                </value>
                <statement name="DO0">
                  <block type="variables_set" id="circuit_reset_stake">
                    <field name="VAR" id="pegasus_current_stake">pegasus-current-stake</field>
                    <value name="VALUE">
                      <block type="variables_get" id="get_init_stake_breaker">
                        <field name="VAR" id="pegasus_initial_stake">pegasus-initial-stake</field>
                      </block>
                    </value>
                    <next>
                      <block type="variables_set" id="circuit_reset_step">
                        <field name="VAR" id="pegasus_martingale_step">pegasus-martingale-step</field>
                        <value name="VALUE">
                          <block type="math_number" id="num_breaker_zero">
                            <field name="NUM">0</field>
                          </block>
                        </value>
                      </block>
                    </next>
                  </block>
                </statement>
                <statement name="ELSE">
                  <block type="variables_set" id="apply_martingale_multiplier">
                    <field name="VAR" id="pegasus_current_stake">pegasus-current-stake</field>
                    <value name="VALUE">
                      <block type="math_arithmetic" id="mult_stake">
                        <field name="OP">MULTIPLY</field>
                        <value name="A">
                          <shadow type="math_number" id="sh_curr">
                            <field name="NUM">1</field>
                          </shadow>
                          <block type="variables_get" id="get_curr_for_mult">
                            <field name="VAR" id="pegasus_current_stake">pegasus-current-stake</field>
                          </block>
                        </value>
                        <value name="B">
                          <block type="variables_get" id="get_mart_factor">
                            <field name="VAR" id="pegasus_mart_multiplier">pegasus-martingale-multiplier</field>
                          </block>
                        </value>
                      </block>
                    </value>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </statement>
        <next>
          <block type="controls_if" id="pegasus_tp_check">
            <mutation xmlns="http://www.w3.org/1999/xhtml" else="1"></mutation>
            <value name="IF0">
              <block type="logic_compare" id="compare_profit">
                <field name="OP">GTE</field>
                <value name="A">
                  <block type="total_profit" id="tot_profit"></block>
                </value>
                <value name="B">
                  <block type="variables_get" id="get_tp_val">
                    <field name="VAR" id="pegasus_take_profit">pegasus-take-profit</field>
                  </block>
                </value>
              </block>
            </value>
            <statement name="DO0">
              <block type="text_print" id="pegasus_tp_alert">
                <value name="TEXT">
                  <shadow type="text" id="sh_txt">
                    <field name="TEXT">PEGASUS AI hit a profit of ${takeProfit} USD.</field>
                  </shadow>
                </value>
              </block>
            </statement>
            <statement name="ELSE">
              <block type="controls_if" id="pegasus_sl_check">
                <mutation xmlns="http://www.w3.org/1999/xhtml" else="1"></mutation>
                <value name="IF0">
                  <block type="logic_compare" id="compare_loss">
                    <field name="OP">LTE</field>
                    <value name="A">
                      <block type="total_profit" id="tot_profit_sl"></block>
                    </value>
                    <value name="B">
                      <block type="math_single" id="neg_sl">
                        <field name="OP">NEG</field>
                        <value name="NUM">
                          <block type="variables_get" id="get_sl_val">
                            <field name="VAR" id="pegasus_loss_threshold">pegasus-loss-threshold</field>
                          </block>
                        </value>
                      </block>
                    </value>
                  </block>
                </value>
                <statement name="DO0">
                  <block type="text_print" id="pegasus_sl_alert">
                    <value name="TEXT">
                      <shadow type="text" id="sh_sl_txt">
                        <field name="TEXT">PEGASUS AI hit Stop Loss limit of -${stopLoss} USD. Safe halt engaged.</field>
                      </shadow>
                    </value>
                  </block>
                </statement>
                <statement name="ELSE">
                  <block type="trade_again" id="pegasus_trade_again"></block>
                </statement>
              </block>
            </statement>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;
};

export const loadPegasusStrategyToWorkspace = (
    symbol: string,
    stake: number,
    takeProfit: number,
    barrier: number = 2,
    tradeType: TPegasusTradeType = 'DIGITOVER',
    stopLoss: number = 1000,
    martingaleMultiplier: number = 2.0
): boolean => {
    try {
        const xmlString = generatePegasusXml({
            symbol,
            stake,
            takeProfit,
            stopLoss,
            tradeType,
            barrier,
            martingaleMultiplier,
            maxLossStreak: 5,
            durationTicks: 1,
        });

        localStorage.setItem('pegasus_active_stake', String(stake));
        localStorage.setItem('pegasus_active_take_profit', String(takeProfit));
        localStorage.setItem('pegasus_active_stop_loss', String(stopLoss));
        localStorage.setItem('pegasus_active_symbol', symbol);
        localStorage.setItem('pegasus_active_tradetype', tradeType);
        localStorage.setItem('pegasus_is_active', 'true');
        localStorage.setItem('bot_builder_token', '1');

        const settings = JSON.parse(localStorage.getItem('dbot_settings') || '{}');
        settings.bot_builder_token = 1;
        localStorage.setItem('dbot_settings', JSON.stringify(settings));

        const loadStrategy = () => {
            const ws = (window as any).Blockly?.derivWorkspace;
            if (ws && (window as any).Blockly?.Xml) {
                try {
                    if (typeof ws.asyncClear === 'function') {
                        ws.asyncClear();
                    } else if (typeof ws.clear === 'function') {
                        ws.clear();
                    }
                } catch (e) {
                    // asyncClear safeguard
                }
                const textToDom = (window as any).Blockly.utils?.xml?.textToDom || (window as any).Blockly.Xml?.textToDom;
                if (textToDom) {
                    const dom = textToDom(xmlString);
                    (window as any).Blockly.Xml.domToWorkspace(dom, ws);
                    ws.strategy_to_load = xmlString;
                    return true;
                }
            }
            return false;
        };

        if (loadStrategy()) return true;

        // If workspace is still mounting, retry with exponential backoff
        setTimeout(loadStrategy, 300);
        setTimeout(loadStrategy, 700);
        setTimeout(loadStrategy, 1500);

        if ((window as any).Blockly) {
            (window as any).Blockly.strategy_to_load = xmlString;
        }
        return true;
    } catch (err) {
        console.error('Failed to load Pegasus strategy into workspace:', err);
        return false;
    }
};
