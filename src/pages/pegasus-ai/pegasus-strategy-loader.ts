/**
 * Pegasus Strategy Generator & Blockly Workspace Injector
 */

export interface IPegasusSignal {
    id: string;
    rank: number;
    marketName: string;
    symbol: string;
    confidence: number;
    tradeType: 'DIGITOVER' | 'DIGITUNDER';
    barrier: number;
    recoveryRule: string;
    description: string;
}

export const generatePegasusXml = (
    symbol: string,
    stake: number,
    takeProfit: number,
    barrier: number = 1
): string => {
    return `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false" data-strategy-origin="pegasus" data-strategy-name="Pegasus AI Engine">
  <variables>
    <variable id="pegasus_stake">pegasus initial stake</variable>
    <variable id="pegasus_tp">pegasus take profit</variable>
    <variable id="pegasus_curr_stake">pegasus current stake</variable>
    <variable id="pegasus_max_martingale">pegasus max martingale</variable>
    <variable id="var_expected_profit">Expected Profit</variable>
    <variable id="var_stake">Stake</variable>
    <variable id="var_win_stake">Win Stake</variable>
    <variable id="var_martingale">Martingale Factor </variable>
    <variable id="var_prediction">Prediction Number</variable>
  </variables>
  <block type="trade_definition" id="pegasus_trade_def" deletable="false" x="0" y="110">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="pegasus_market" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">${symbol}</field>
        <next>
          <block type="trade_definition_tradetype" id="pegasus_tradetype" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">overunder</field>
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
      <block type="variables_set" id="init_pegasus_stake">
        <field name="VAR" id="pegasus_stake">pegasus initial stake</field>
        <value name="VALUE">
          <block type="math_number" id="num_stake">
            <field name="NUM">${stake}</field>
          </block>
        </value>
        <next>
          <block type="variables_set" id="init_pegasus_tp">
            <field name="VAR" id="pegasus_tp">pegasus take profit</field>
            <value name="VALUE">
              <block type="math_number" id="num_tp">
                <field name="NUM">${takeProfit}</field>
              </block>
            </value>
            <next>
              <block type="variables_set" id="init_curr_stake">
                <field name="VAR" id="pegasus_curr_stake">pegasus current stake</field>
                <value name="VALUE">
                  <block type="math_number" id="num_curr_stake">
                    <field name="NUM">${stake}</field>
                  </block>
                </value>
                <next>
                  <block type="variables_set" id="init_expected_profit">
                    <field name="VAR" id="var_expected_profit">Expected Profit</field>
                    <value name="VALUE">
                      <block type="math_number" id="num_exp_profit">
                        <field name="NUM">${takeProfit}</field>
                      </block>
                    </value>
                    <next>
                      <block type="variables_set" id="init_stake">
                        <field name="VAR" id="var_stake">Stake</field>
                        <value name="VALUE">
                          <block type="math_number" id="num_stk">
                            <field name="NUM">${stake}</field>
                          </block>
                        </value>
                        <next>
                          <block type="variables_set" id="init_win_stake">
                            <field name="VAR" id="var_win_stake">Win Stake</field>
                            <value name="VALUE">
                              <block type="math_number" id="num_wstk">
                                <field name="NUM">${stake}</field>
                              </block>
                            </value>
                            <next>
                              <block type="variables_set" id="init_martingale">
                                <field name="VAR" id="var_martingale">Martingale Factor </field>
                                <value name="VALUE">
                                  <block type="math_number" id="num_mart">
                                    <field name="NUM">2.2</field>
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
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="pegasus_options">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="true"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number" id="dur_val">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number" id="amt_val">
            <field name="NUM">${stake}</field>
          </shadow>
          <block type="variables_get" id="get_curr_stake">
            <field name="VAR" id="pegasus_curr_stake">pegasus current stake</field>
          </block>
        </value>
        <value name="PREDICTION">
          <shadow type="math_number" id="pred_val">
            <field name="NUM">${barrier}</field>
          </shadow>
        </value>
      </block>
    </statement>
  </block>
  <block type="before_purchase" id="pegasus_before_purchase" deletable="false" x="0" y="700">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="purchase" id="pegasus_purchase_action">
        <field name="PURCHASE_LIST">DIGITOVER</field>
      </block>
    </statement>
  </block>
  <block type="after_purchase" id="pegasus_after_purchase" deletable="false" x="0" y="850">
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
            <field name="VAR" id="pegasus_curr_stake">pegasus current stake</field>
            <value name="VALUE">
              <block type="variables_get" id="get_initial_stake">
                <field name="VAR" id="pegasus_stake">pegasus initial stake</field>
              </block>
            </value>
          </block>
        </statement>
        <statement name="ELSE">
          <block type="variables_set" id="apply_martingale_loss">
            <field name="VAR" id="pegasus_curr_stake">pegasus current stake</field>
            <value name="VALUE">
              <block type="math_arithmetic" id="mult_stake">
                <field name="OP">MULTIPLY</field>
                <value name="A">
                  <shadow type="math_number" id="sh_curr">
                    <field name="NUM">1</field>
                  </shadow>
                  <block type="variables_get" id="get_curr_for_mult">
                    <field name="VAR" id="pegasus_curr_stake">pegasus current stake</field>
                  </block>
                </value>
                <value name="B">
                  <shadow type="math_number" id="mult_factor">
                    <field name="NUM">2.2</field>
                  </shadow>
                </value>
              </block>
            </value>
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
                    <field name="VAR" id="pegasus_tp">pegasus take profit</field>
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
              <block type="trade_again" id="pegasus_trade_again"></block>
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
    barrier: number = 1
): boolean => {
    try {
        const xmlString = generatePegasusXml(symbol, stake, takeProfit, barrier);
        
        // Persist parameters in localStorage for AI HUD and target monitoring
        localStorage.setItem('pegasus_active_stake', String(stake));
        localStorage.setItem('pegasus_active_take_profit', String(takeProfit));
        localStorage.setItem('pegasus_active_symbol', symbol);
        localStorage.setItem('pegasus_is_active', 'true');

        const workspace = (window as any).Blockly?.derivWorkspace;
        if (workspace && (window as any).Blockly?.Xml) {
            workspace.clear();
            const dom = (window as any).Blockly.Xml.textToDom(xmlString);
            (window as any).Blockly.Xml.domToWorkspace(dom, workspace);
            workspace.strategy_to_load = xmlString;
            return true;
        }

        console.warn('Blockly workspace not ready, cached in strategy_to_load');
        if ((window as any).Blockly) {
            (window as any).Blockly.strategy_to_load = xmlString;
        }
        return true;
    } catch (err) {
        console.error('Failed to load Pegasus strategy into workspace:', err);
        return false;
    }
};
