import React, { lazy, Suspense, useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import { generateOAuthURL } from '@/components/shared';
import DesktopWrapper from '@/components/shared_ui/desktop-wrapper';
import Dialog from '@/components/shared_ui/dialog';
import MobileWrapper from '@/components/shared_ui/mobile-wrapper';
import Tabs from '@/components/shared_ui/tabs/tabs';
import TradeTypeConfirmationModal from '@/components/trade-type-confirmation-modal';
import TradingViewModal from '@/components/trading-view-chart/trading-view-modal';
import { DBOT_TABS, TAB_IDS } from '@/constants/bot-contents';
import { api_base, updateWorkspaceName } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { isDbotRTL } from '@/external/bot-skeleton/utils/workspace';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import {
    disableUrlParameterApplication,
    enableUrlParameterApplication,
    setupTradeTypeChangeListener,
} from '@/utils/blockly-url-param-handler';
import {
    checkAndShowTradeTypeModal,
    getModalState,
    handleTradeTypeCancel,
    handleTradeTypeConfirm,
    resetUrlParamProcessing,
    setModalStateChangeCallback,
} from '@/utils/trade-type-modal-handler';
import {
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedObjectsColumnCaptionRegularIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon,
} from '@deriv/quill-icons/LabelPaired';
import { LegacyGuide1pxIcon } from '@deriv/quill-icons/Legacy';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import RunPanel from '../../components/run-panel';
import ChartModal from '../chart/chart-modal';
import Dashboard from '../dashboard';
import DashboardV2 from '../dashboard/dashboard-v2';
import CopyTrading from '../copy-trading';
import DCircles from '../dcircles';
import FreeBots from '../free-bots';
import PegasusAi from '../pegasus-ai';
import { PegasusActivatedModal } from '../pegasus-ai/pegasus-activated-modal';
import { PegasusVictoryModal } from '../pegasus-ai/pegasus-victory-modal';
import { AiLiveHud } from '../pegasus-ai/ai-live-hud';
import MainNav, { TNavItem } from './main-nav';
import RunStrategy from '../dashboard/run-strategy';
import './main.scss';

const ChartWrapper = lazy(() => import('../chart/chart-wrapper'));
const Tutorial = lazy(() => import('../tutorials'));

const AppWrapper = observer(() => {
    const { connectionStatus } = useApiBase();
    const { dashboard, load_modal, run_panel, quick_strategy, summary_card, blockly_store } = useStore();
    const { is_loading } = blockly_store;
    const {
        active_tab,
        active_tour,
        is_chart_modal_visible,
        is_trading_view_modal_visible,
        setActiveTab,
        setWebSocketState,
        setActiveTour,
        setTourDialogVisibility,
    } = dashboard;
    const { dashboard_strategies } = load_modal;
    const {
        is_dialog_open,
        is_drawer_open,
        dialog_options,
        onCancelButtonClick,
        onCloseDialog,
        onOkButtonClick,
        stopBot,
    } = run_panel;
    const { is_open } = quick_strategy;
    const { cancel_button_text, ok_button_text, title, message, dismissable, is_closed_on_cancel } = dialog_options as {
        [key: string]: string;
    };
    const { clear } = summary_card;
    const { DASHBOARD, BOT_BUILDER } = DBOT_TABS;
    const init_render = React.useRef(true);
    const hash = ['dashboard', 'bot_builder', 'chart', 'tutorial', 'copycat', 'dcircles', 'free_bots', 'pegasus_ai'];
    const { isDesktop } = useDevice();
    const location = useLocation();
    const navigate = useNavigate();
    const [left_tab_shadow, setLeftTabShadow] = useState<boolean>(false);
    const [right_tab_shadow, setRightTabShadow] = useState<boolean>(false);

    // Pegasus AI Modal States
    const [is_pegasus_activated_open, setIsPegasusActivatedOpen] = useState<boolean>(false);
    const [is_victory_modal_open, setIsVictoryModalOpen] = useState<boolean>(false);
    const [pegasus_victory_amount, setPegasusVictoryAmount] = useState<string | number>('556.32');

    // Trade type modal state
    const [tradeTypeModalState, setTradeTypeModalState] = useState(getModalState());

    /**
     * Helper function to get modal props with enhanced type safety and clear documentation
     *
     * Props serve distinct purposes:
     * - current_trade_type: Technical identifier for API/internal use (format: "category/type")
     * - current_trade_type_display_name: Human-readable name for UI display
     *
     * This separation ensures proper data flow between technical systems and user interface
     */
    const getTradeTypeModalProps = () => {
        const { tradeTypeData } = tradeTypeModalState;

        return {
            is_visible: tradeTypeModalState.isVisible,
            trade_type_display_name: tradeTypeData?.displayName || '',

            // Technical identifier for internal/API use (e.g., "callput/callput")
            // Used by backend systems and technical integrations
            current_trade_type: tradeTypeData?.currentTradeType
                ? `${tradeTypeData.currentTradeType.tradeTypeCategory}/${tradeTypeData.currentTradeType.tradeType}`
                : 'N/A',

            // Human-readable display name for UI (e.g., "Rise/Fall")
            // Used for user-facing text and modal content
            current_trade_type_display_name: tradeTypeData?.currentTradeTypeDisplayName || 'N/A',

            onConfirm: handleTradeTypeConfirm,
            onCancel: handleTradeTypeCancel,
        };
    };

    let tab_value: number | string = active_tab;
    const GetHashedValue = (tab: number) => {
        tab_value = location.hash?.split('#')[1];
        if (!tab_value) return tab;
        return Number(hash.indexOf(String(tab_value)));
    };
    const active_hash_tab = GetHashedValue(active_tab);

    // Set up modal state change listener
    React.useEffect(() => {
        setModalStateChangeCallback(new_state => {
            setTradeTypeModalState(new_state);
        });
    }, [is_loading]);

    // Reset URL parameter processing when location changes
    React.useEffect(() => {
        resetUrlParamProcessing();
    }, [location.search]);

    // Set up Pegasus AI event listeners & profit target monitoring
    React.useEffect(() => {
        const handleProfitHit = (e: any) => {
            const msg = e?.detail?.message || '';
            const match = msg.match(/hit a profit of\s+([0-9.,]+)/i);
            const amount = match ? match[1] : (e?.detail?.profit || '556.32');
            setPegasusVictoryAmount(amount);
            setIsVictoryModalOpen(true);
            if (run_panel.is_running) {
                run_panel.stopBot();
            }
        };

        const handlePegasusHandoff = () => {
            setIsPegasusActivatedOpen(true);
        };

        window.addEventListener('gsm:pegasus-profit-target-hit', handleProfitHit);
        window.addEventListener('gsm:pegasus-activated-modal-open', handlePegasusHandoff);

        return () => {
            window.removeEventListener('gsm:pegasus-profit-target-hit', handleProfitHit);
            window.removeEventListener('gsm:pegasus-activated-modal-open', handlePegasusHandoff);
        };
    }, [run_panel]);

    React.useEffect(() => {
        const isPegasusActive = localStorage.getItem('pegasus_is_active') === 'true';
        const targetTp = parseFloat(localStorage.getItem('pegasus_active_take_profit') || localStorage.getItem('pegasus_input_tp') || '0');
        if (isPegasusActive && run_panel.is_running && targetTp > 0 && summary_card.profit >= targetTp) {
            run_panel.stopBot();
            setPegasusVictoryAmount(summary_card.profit.toFixed(2));
            setIsVictoryModalOpen(true);
            localStorage.removeItem('pegasus_is_active');
        }
    }, [summary_card.profit, run_panel.is_running, run_panel]);

    React.useEffect(() => {
        const el_dashboard = document.getElementById('id-dbot-dashboard');
        const el_tutorial = document.getElementById('id-tutorials');

        const observer_dashboard = new window.IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setLeftTabShadow(false);
                    return;
                }
                setLeftTabShadow(true);
            },
            {
                root: null,
                threshold: 0.5,
            }
        );

        const observer_tutorial = new window.IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRightTabShadow(false);
                    return;
                }
                setRightTabShadow(true);
            },
            {
                root: null,
                threshold: 0.5,
            }
        );
        if (el_dashboard) observer_dashboard.observe(el_dashboard);
        if (el_tutorial) observer_tutorial.observe(el_tutorial);

        return () => {
            observer_dashboard.disconnect();
            observer_tutorial.disconnect();
        };
    });

    React.useEffect(() => {
        if (connectionStatus !== CONNECTION_STATUS.OPENED) {
            const is_bot_running = document.getElementById('db-animation__stop-button') !== null;
            if (is_bot_running) {
                clear();
                stopBot();
                api_base.setIsRunning(false);
                setWebSocketState(false);
            }
        }
    }, [clear, connectionStatus, setWebSocketState, stopBot]);

    // Update tab shadows height to match bot builder height
    const updateTabShadowsHeight = () => {
        const botBuilderEl = document.getElementById('id-bot-builder');
        const leftShadow = document.querySelector('.tabs-shadow--left') as HTMLElement;
        const rightShadow = document.querySelector('.tabs-shadow--right') as HTMLElement;

        if (botBuilderEl && leftShadow && rightShadow) {
            const height = botBuilderEl.offsetHeight;
            leftShadow.style.height = `${height}px`;
            rightShadow.style.height = `${height}px`;
        }
    };

    React.useEffect(() => {
        let pollTimeoutId: ReturnType<typeof setTimeout> | null = null;

        // Handle URL trade type parameters when switching to Bot Builder tab
        if (active_tab === BOT_BUILDER) {
            // Use requestAnimationFrame to ensure Blockly workspace is fully initialized
            requestAnimationFrame(() => {
                // Disable automatic URL parameter application to prevent changes before modal
                disableUrlParameterApplication();

                // Set up listener for manual trade type changes (only once)
                setupTradeTypeChangeListener();

                // Create unified handler for both immediate and delayed execution
                const handleTradeTypeModal = () => {
                    checkAndShowTradeTypeModal(
                        // onConfirm: Changes are now handled by the modal component
                        () => {
                            // Re-enable URL parameter application for future parameters
                            enableUrlParameterApplication();
                        },
                        // onCancel: URL parameter removal is now handled by the modal component
                        () => {}
                    );
                };

                // Wait for Blockly to finish loading before checking for URL parameters
                if (!blockly_store.is_loading) {
                    // Blockly is loaded, but add longer delay to ensure workspace is fully initialized
                    // and trade type fields are populated
                    setTimeout(() => {
                        handleTradeTypeModal();
                    }, 500);
                } else {
                    // Blockly is still loading, wait for it to finish with optimized polling
                    let pollAttempts = 0;
                    const maxPollAttempts = 10; // Maximum 5 seconds (10 * 500ms) - optimized performance

                    const checkBlocklyLoaded = () => {
                        if (!blockly_store.is_loading) {
                            handleTradeTypeModal();
                            return; // Exit polling once loaded
                        }

                        if (pollAttempts < maxPollAttempts) {
                            pollAttempts++;
                            // Use 500ms intervals for better performance (5x improvement from 100ms)
                            pollTimeoutId = setTimeout(checkBlocklyLoaded, 500);
                        } else {
                            console.warn(
                                'Blockly loading timeout after 5 seconds - proceeding without URL parameter check'
                            );
                        }
                    };

                    checkBlocklyLoaded();
                }
            });
        }

        // Cleanup function to prevent memory leaks
        return () => {
            if (pollTimeoutId) {
                clearTimeout(pollTimeoutId);
                pollTimeoutId = null;
            }
        };
    }, [active_tab, is_loading]);

    React.useEffect(() => {
        // Run on mount and when active tab changes
        updateTabShadowsHeight();

        if (is_open) {
            setTourDialogVisibility(false);
        }
        if (init_render.current) {
            setActiveTab(Number(active_hash_tab));
            if (!isDesktop) handleTabChange(Number(active_hash_tab));
            init_render.current = false;
        } else {
            // Preserve URL parameters when navigating
            const currentSearch = window.location.search;
            navigate(`${currentSearch}#${hash[active_tab] || hash[0]}`);
        }
        if (active_tour !== '') {
            setActiveTour('');
        }

        // Prevent scrolling when tutorial tab is active (only on mobile)
        const mainElement = document.querySelector('.main__container');
        if (active_tab === DBOT_TABS.TUTORIAL && !isDesktop) {
            document.body.style.overflow = 'hidden';
            if (mainElement instanceof HTMLElement) {
                mainElement.classList.add('no-scroll');
            }
        } else {
            document.body.style.overflow = '';
            if (mainElement instanceof HTMLElement) {
                mainElement.classList.remove('no-scroll');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab]);

    React.useEffect(() => {
        const trashcan_init_id = setTimeout(() => {
            if (active_tab === BOT_BUILDER && Blockly?.derivWorkspace?.trashcan) {
                const trashcanY = window.innerHeight - 250;
                let trashcanX;
                if (is_drawer_open) {
                    trashcanX = isDbotRTL() ? 380 : window.innerWidth - 460;
                } else {
                    trashcanX = isDbotRTL() ? 20 : window.innerWidth - 100;
                }
                Blockly?.derivWorkspace?.trashcan?.setTrashcanPosition(trashcanX, trashcanY);
            }
        }, 100);

        return () => {
            clearTimeout(trashcan_init_id); // Clear the timeout on unmount
        };
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab, is_drawer_open]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (dashboard_strategies.length > 0) {
            // Needed to pass this to the Callback Queue as on tab changes
            // document title getting override by 'Bot | Deriv' only
            timer = setTimeout(() => {
                updateWorkspaceName();
            });
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [dashboard_strategies, active_tab]);

    const handleTabChange = React.useCallback(
        (tab_index: number) => {
            setActiveTab(tab_index);
            const el_id = TAB_IDS[tab_index];
            if (el_id) {
                const el_tab = document.getElementById(el_id);
                setTimeout(() => {
                    el_tab?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }, 10);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [active_tab]
    );

    // [AI]
    const handleLoginGeneration = async () => {
        const oauthUrl = await generateOAuthURL();
        if (oauthUrl) {
            window.location.replace(oauthUrl);
        } else {
            console.error('Failed to generate OAuth URL');
        }
    };
    // [/AI]

    const navItems: TNavItem[] = [
        {
            index: DBOT_TABS.DASHBOARD,
            label: localize('Dashboard'),
            icon: (
                <svg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px' viewBox='0 0 11 18' role='img' fill='currentColor'>
                    <path d='M1.375 5A.385.385 0 0 0 1 5.375v3.75c0 .21.164.375.375.375h2.25A.385.385 0 0 0 4 9.125v-3.75A.4.4 0 0 0 3.625 5zM.25 5.375c0-.61.492-1.125 1.125-1.125h2.25c.61 0 1.125.516 1.125 1.125v3.75c0 .633-.516 1.125-1.125 1.125h-2.25A1.11 1.11 0 0 1 .25 9.125zM7.375 9.5A.385.385 0 0 0 7 9.875v3.75c0 .21.164.375.375.375h2.25a.385.385 0 0 0 .375-.375v-3.75a.4.4 0 0 0-.375-.375zm-1.125.375c0-.61.492-1.125 1.125-1.125h2.25c.61 0 1.125.516 1.125 1.125v3.75c0 .633-.516 1.125-1.125 1.125h-2.25a1.11 1.11 0 0 1-1.125-1.125zM3.625 11.75h-2.25a.385.385 0 0 0-.375.375v1.5c0 .21.164.375.375.375h2.25A.385.385 0 0 0 4 13.625v-1.5a.4.4 0 0 0-.375-.375M1.375 11h2.25c.61 0 1.125.516 1.125 1.125v1.5c0 .633-.516 1.125-1.125 1.125h-2.25A1.11 1.11 0 0 1 .25 13.625v-1.5C.25 11.515.742 11 1.375 11m6-6A.385.385 0 0 0 7 5.375v1.5c0 .21.164.375.375.375h2.25A.385.385 0 0 0 10 6.875v-1.5A.4.4 0 0 0 9.625 5zm-1.125.375c0-.61.492-1.125 1.125-1.125h2.25c.61 0 1.125.516 1.125 1.125v1.5C10.75 7.508 10.234 8 9.625 8h-2.25A1.11 1.11 0 0 1 6.25 6.875z' />
                </svg>
            ),
        },
        {
            index: DBOT_TABS.BOT_BUILDER,
            label: localize('Bot Builder'),
            icon: (
                <svg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px' viewBox='0 0 12 18' role='img' fill='currentColor'>
                    <path d='M10.43 11.516c.258.234.422.562.422.96 0 .399-.165.727-.422.961-.258.211-.61.329-.961.376-.047 0-.094 0-.117-.024v.234c0 .329-.188.61-.446.797a1.6 1.6 0 0 1-.914.305h-.984c-.469 0-.703-.562-.399-.89a1.6 1.6 0 0 0-.187-.446.6.6 0 0 0-.445-.164.58.58 0 0 0-.422.164c-.07.117-.14.258-.188.445.305.329.07.891-.398.891h-.985c-.351 0-.68-.117-.914-.305a.99.99 0 0 1-.422-.82v-3c0-.14 0-.234-.023-.328 0-.117 0-.188.023-.399v-.75c0-.07 0-.164-.023-.257-.023 0-.07.023-.117 0-.352-.024-.68-.118-.938-.328-.28-.235-.422-.563-.422-.961 0-.399.165-.727.446-.938.258-.187.586-.258.914-.281h.117c.023-.094.023-.188.023-.258 0-.328.188-.61.422-.797a1.6 1.6 0 0 1 .938-.305h.656v-.117c.024-.351.14-.703.375-.96.234-.258.563-.423.961-.423s.727.164.96.422c.235.258.353.61.376.961 0 .047 0 .07-.024.117h.68c.352 0 .68.118.938.305.234.188.422.469.422.797v4.64h.117c.351.024.703.141.96.376m-6.492 2.882h.726v-.14c.024-.328.14-.68.352-.938.234-.258.562-.422.96-.422.399 0 .727.165.962.422.234.258.351.61.375.961.023.047 0 .07 0 .117h.703c.187 0 .351-.07.468-.14.094-.094.141-.164.141-.235v-.539c0-.468.563-.68.89-.398a.7.7 0 0 0 .422-.188.52.52 0 0 0 .188-.421c0-.211-.07-.329-.187-.422a.7.7 0 0 0-.422-.188c-.328.281-.891.047-.891-.422v-.82H7.008c-.469 0-.703-.562-.399-.89a1.2 1.2 0 0 0-.187-.422.56.56 0 0 0-.445-.188.52.52 0 0 0-.422.188c-.094.093-.14.234-.188.421.305.329.07.891-.398.891H3.352V14c0 .094.023.164.14.258s.258.14.446.14' />
                </svg>
            ),
        },
        {
            index: DBOT_TABS.CHART,
            label: localize('Charts'),
            icon: (
                <svg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px' viewBox='0 0 12 18' role='img' fill='currentColor'>
                    <path d='M.75 4.625v8.25A1.11 1.11 0 0 0 1.875 14h9.75c.188 0 .375.188.375.375 0 .21-.187.375-.375.375h-9.75A1.85 1.85 0 0 1 0 12.875v-8.25c0-.187.164-.375.375-.375.188 0 .375.188.375.375m10.383 2.531-3.375 3.375a.397.397 0 0 1-.54 0L5.25 8.54l-2.367 2.367a.397.397 0 0 1-.54 0 .397.397 0 0 1 0-.539L4.97 7.742c.14-.14.398-.14.539 0L7.5 9.734l3.094-3.117c.14-.14.398-.14.539 0 .14.14.14.399 0 .54' />
                </svg>
            ),
        },
        {
            index: DBOT_TABS.TUTORIAL,
            label: localize('Tutorials'),
            icon: (
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16px' height='16px' role='img' fill='currentColor' className='icon-general-fill-g-path'>
                    <path d='M6.765 5.076A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .765.424l4-2.5a.5.5 0 0 0 0-.848zM9.557 8 7 9.598V6.402z' />
                    <path d='M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1v9.5a1.5 1.5 0 0 1-1.5 1.5h-2.191l.638 1.276a.5.5 0 1 1-.894.448L10.19 14H5.809l-.862 1.724a.5.5 0 1 1-.894-.448L4.69 14H2.5A1.5 1.5 0 0 1 1 12.5V3a1 1 0 0 1-1-1zm13.5 12h-11a.5.5 0 0 1-.5-.5V3h12v9.5a.5.5 0 0 1-.5.5M15 1H1v1h14z' />
                </svg>
            ),
        },
        {
            index: DBOT_TABS.COPYCAT,
            label: localize('Copy Trading'),
            icon: (
                <svg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px' viewBox='0 0 12 18' role='img' fill='currentColor'>
                    <path d='M1.617 8.445a.395.395 0 0 1-.375.305c-.234 0-.422-.187-.375-.422C1.407 6.008 3.492 4.25 6 4.25c1.898 0 3.563 1.031 4.5 2.555v-1.43c0-.187.164-.375.375-.375.188 0 .375.188.375.375v2.25c0 .21-.187.375-.375.375h-2.25a.37.37 0 0 1-.375-.375c0-.187.164-.375.375-.375h1.266a4.501 4.501 0 0 0-8.274 1.195m8.742 2.133a.42.42 0 0 1 .399-.328c.21 0 .398.21.351.445A5.25 5.25 0 0 1 6 14.75a5.22 5.22 0 0 1-4.5-2.531v1.406a.37.37 0 0 1-.375.375.37.37 0 0 1-.375-.375v-2.25c0-.187.164-.375.375-.375h2.25c.21 0 .375.188.375.375a.37.37 0 0 1-.375.375h-1.29C2.86 13.11 4.314 14 6 14c2.11 0 3.89-1.453 4.36-3.422' />
                </svg>
            ),
        },
        {
            index: DBOT_TABS.DCIRCLES,
            label: localize('DCircles'),
            icon: (
                <svg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px' viewBox='0 0 12 18' role='img' fill='currentColor'>
                    <path d='M11.25 9.5a5.23 5.23 0 0 0-2.625-4.523 5.14 5.14 0 0 0-5.25 0A5.18 5.18 0 0 0 .75 9.5a5.19 5.19 0 0 0 2.625 4.547c1.617.96 3.61.96 5.25 0A5.24 5.24 0 0 0 11.25 9.5M0 9.5a5.96 5.96 0 0 1 3-5.18 5.97 5.97 0 0 1 6 0 6 6 0 0 1 3 5.18 6.01 6.01 0 0 1-3 5.203 5.97 5.97 0 0 1-6 0A5.97 5.97 0 0 1 0 9.5m7.5 0c0-.516-.305-1.008-.75-1.29a1.55 1.55 0 0 0-1.5 0c-.469.282-.75.774-.75 1.29 0 .54.281 1.031.75 1.313a1.55 1.55 0 0 0 1.5 0c.445-.282.75-.774.75-1.313m-3.75 0c0-.797.422-1.523 1.125-1.945a2.27 2.27 0 0 1 2.25 0c.68.422 1.125 1.148 1.125 1.945 0 .82-.445 1.547-1.125 1.969a2.27 2.27 0 0 1-2.25 0A2.27 2.27 0 0 1 3.75 9.5' />
                </svg>
            ),
        },
        {
            index: DBOT_TABS.FREE_BOTS,
            label: localize('Free Bots'),
            icon: (
                <svg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px' viewBox='0 0 11 18' role='img' fill='currentColor'>
                    <path d='M2.313 5H1.187A.185.185 0 0 0 1 5.188v1.125c0 .117.07.187.188.187h1.125c.093 0 .187-.07.187-.187V5.188A.2.2 0 0 0 2.313 5m-1.126-.75h1.126a.94.94 0 0 1 .937.938v1.125c0 .539-.422.937-.937.937H1.187a.91.91 0 0 1-.937-.937V5.188c0-.516.398-.938.938-.938m1.126 4.5H1.187A.185.185 0 0 0 1 8.938v1.124c0 .118.07.188.188.188h1.125c.093 0 .187-.07.187-.187V8.937a.2.2 0 0 0-.187-.187M1.187 8h1.126a.94.94 0 0 1 .937.938v1.124c0 .54-.422.938-.937.938H1.187a.91.91 0 0 1-.937-.937V8.937C.25 8.423.648 8 1.188 8m0 4.5a.185.185 0 0 0-.187.188v1.124c0 .118.07.188.188.188h1.125c.093 0 .187-.07.187-.187v-1.126a.2.2 0 0 0-.187-.187zm-.937.188c0-.516.398-.938.938-.938h1.125a.94.94 0 0 1 .937.938v1.124c0 .54-.422.938-.937.938H1.187a.91.91 0 0 1-.937-.937zM6.063 5H4.938a.185.185 0 0 0-.188.188v1.125c0 .117.07.187.188.187h1.125c.093 0 .187-.07.187-.187V5.188A.2.2 0 0 0 6.063 5m-1.125-.75h1.125A.94.94 0 0 1 7 5.188v1.125c0 .539-.422.937-.937.937H4.938A.91.91 0 0 1 4 6.313V5.188c0-.516.398-.938.938-.938m0 4.5a.185.185 0 0 0-.188.188v1.124c0 .118.07.188.188.188h1.125c.093 0 .187-.07.187-.187V8.937a.2.2 0 0 0-.187-.187zM4 8.938C4 8.422 4.398 8 4.938 8h1.125A.94.94 0 0 1 7 8.938v1.124c0 .54-.422.938-.937.938H4.938A.91.91 0 0 1 4 10.063zM6.063 12.5H4.938a.185.185 0 0 0-.188.188v1.124c0 .118.07.188.188.188h1.125c.093 0 .187-.07.187-.187v-1.126a.2.2 0 0 0-.187-.187m-1.125-.75h1.125a.94.94 0 0 1 .937.938v1.124c0 .54-.422.938-.937.938H4.938A.91.91 0 0 1 4 13.813v-1.126c0-.515.398-.937.938-.937M8.688 5a.185.185 0 0 0-.188.188v1.125c0 .117.07.187.188.187h1.124c.094 0 .188-.07.188-.187V5.188A.2.2 0 0 0 9.813 5zm-.938.188c0-.516.398-.938.938-.938h1.124a.94.94 0 0 1 .938.938v1.125c0 .539-.422.937-.937.937H8.687a.91.91 0 0 1-.937-.937zM9.813 8.75H8.687a.185.185 0 0 0-.187.188v1.124c0 .118.07.188.188.188h1.124c.094 0 .188-.07.188-.187V8.937a.2.2 0 0 0-.187-.187M8.687 8h1.126a.94.94 0 0 1 .937.938v1.124c0 .54-.422.938-.937.938H8.687a.91.91 0 0 1-.937-.937V8.937c0-.515.398-.937.938-.937m0 4.5a.185.185 0 0 0-.188.188v1.124c0 .118.07.188.188.188h1.124c.094 0 .188-.07.188-.187v-1.126a.2.2 0 0 0-.187-.187zm-.937.188c0-.516.398-.938.938-.938h1.124a.94.94 0 0 1 .938.938v1.124c0 .54-.422.938-.937.938H8.687a.91.91 0 0 1-.937-.937z' />
                </svg>
            ),
        },
        {
            index: DBOT_TABS.PEGASUS_AI,
            label: localize('Pegasus AI'),
            icon: (
                <svg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                    <rect x='3' y='11' width='18' height='10' rx='2'></rect>
                    <circle cx='12' cy='5' r='2'></circle>
                    <path d='M12 7v4'></path>
                    <line x1='8' y1='16' x2='8.01' y2='16'></line>
                    <line x1='16' y1='16' x2='16.01' y2='16'></line>
                </svg>
            ),
        },
    ];
    return (
        <React.Fragment>
            <div className='main'>
                <div
                    className={classNames('main__container', {
                        'main__container--active': active_tour && active_tab === DASHBOARD && !isDesktop,
                    })}
                >
                    <MainNav items={navItems} activeIndex={active_tab} onTabClick={handleTabChange} />
                    <div
                        className={classNames('main__content', {
                            'main__content--drawer-closed': !is_drawer_open,
                        })}
                        id='id-dbot-dashboard'
                    >
                        {(() => {
                            switch (active_tab) {
                                case DBOT_TABS.DASHBOARD:
                                    return <DashboardV2 handleTabChange={handleTabChange} />;
                                case DBOT_TABS.BOT_BUILDER:
                                    return null;
                                case DBOT_TABS.CHART:
                                    return (
                                        <Suspense
                                            fallback={<ChunkLoader message={localize('Please wait, loading chart...')} />}
                                        >
                                            <ChartWrapper show_digits_stats={false} />
                                        </Suspense>
                                    );
                                case DBOT_TABS.TUTORIAL:
                                    return (
                                        <div className='tutorials-wrapper'>
                                            <Suspense
                                                fallback={
                                                    <ChunkLoader message={localize('Please wait, loading tutorials...')} />
                                                }
                                            >
                                                <Tutorial handleTabChange={handleTabChange} />
                                            </Suspense>
                                        </div>
                                    );
                                case DBOT_TABS.COPYCAT:
                                    return <CopyTrading />;
                                case DBOT_TABS.DCIRCLES:
                                    return <DCircles />;
                                case DBOT_TABS.FREE_BOTS:
                                    return <FreeBots handleTabChange={handleTabChange} />;
                                case DBOT_TABS.PEGASUS_AI:
                                    return <PegasusAi handleTabChange={handleTabChange} />;
                                default:
                                    return <DashboardV2 handleTabChange={handleTabChange} />;
                            }
                        })()}
                    </div>
                </div>
            </div>
            <DesktopWrapper>
                <div className='main__run-strategy-wrapper'>
                    <RunStrategy />
                    <RunPanel />
                </div>
                <ChartModal />
                <TradingViewModal />
            </DesktopWrapper>
            <MobileWrapper>{!is_open && <RunPanel />}</MobileWrapper>
            <Dialog
                cancel_button_text={cancel_button_text || localize('Cancel')}
                className='dc-dialog__wrapper--fixed'
                confirm_button_text={ok_button_text || localize('Ok')}
                has_close_icon
                is_mobile_full_width={false}
                is_visible={is_dialog_open}
                onCancel={onCancelButtonClick}
                onClose={onCloseDialog}
                onConfirm={onOkButtonClick || onCloseDialog}
                portal_element_id='modal_root'
                title={title}
                login={handleLoginGeneration}
                dismissable={dismissable} // Prevents closing on outside clicks
                is_closed_on_cancel={is_closed_on_cancel}
            >
                {message}
            </Dialog>

            {/* Trade Type Confirmation Modal */}
            {(() => {
                const modalProps = getTradeTypeModalProps();
                return (
                    <TradeTypeConfirmationModal
                        is_visible={modalProps.is_visible}
                        trade_type_display_name={modalProps.trade_type_display_name}
                        current_trade_type={modalProps.current_trade_type}
                        current_trade_type_display_name={modalProps.current_trade_type_display_name}
                        onConfirm={modalProps.onConfirm}
                        onCancel={modalProps.onCancel}
                    />
                );
            })()}

            {/* Pegasus AI Live HUD & Modals */}
            <AiLiveHud onClick={() => handleTabChange(DBOT_TABS.BOT_BUILDER)} />
            <PegasusActivatedModal
                isOpen={is_pegasus_activated_open}
                onClose={() => setIsPegasusActivatedOpen(false)}
                onActivate={() => {
                    setIsPegasusActivatedOpen(false);
                    setTimeout(() => {
                        run_panel.onRunButtonClick();
                    }, 350);
                }}
            />
            <PegasusVictoryModal
                isOpen={is_victory_modal_open}
                profitAmount={pegasus_victory_amount}
                onContinue={() => setIsVictoryModalOpen(false)}
            />
        </React.Fragment>
    );
});

export default AppWrapper;
