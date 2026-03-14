import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ─── Translation resources ────────────────────────────────────────────────────
// Data labels (RSI, MACD, VaR etc.) always remain in English.
// Only UI chrome, navigation, buttons, and narrative labels are translated.

const resources = {
    en: {
        translation: {
            nav: {
                home: 'Home', watchlist: 'Watchlist', archive: 'Archive',
                screener: 'Screener', methodology: 'Methodology', settings: 'Settings',
                signIn: 'Sign In', signUp: 'Sign Up', signOut: 'Sign Out',
            },
            hero: {
                headline: 'Institutional-Grade Quantitative Research',
                subheadline: 'AI-powered signals across momentum, risk, sentiment, and strategy — shared across our entire research community.',
                placeholder: 'Ticker, company, crypto, commodity, ISIN… (press T)',
                popular: 'Popular:',
                generateReport: 'Generate Report →',
                viewReport: 'View Current Report →',
                compare: 'Compare two assets side-by-side',
                liveActivity: 'Live',
            },
            report: {
                generating: 'Analyzing {{ticker}}…',
                complete: 'Analysis Complete',
                signals: '{{count}} signals processed',
                sharedReport: '✓ Shared report',
                reportId: 'Report ID',
                generatedAt: 'Generated',
                researchers: 'researchers',
                viewFull: 'View Full Report ↓',
                subscribe: 'Subscribe to {{ticker}} updates',
                nextRefresh: 'Next refresh: {{hours}}h',
            },
            sections: {
                sectionA: 'Section A — Signal Summary',
                sectionB: 'Section B — Technical Analysis',
                sectionC: 'Section C — Fundamental Analysis',
                sectionD: 'Section D — Strategy & Positioning',
                sectionE: 'Section E — Deep Dive Modules',
            },
            watchlist: { title: 'Watchlist', refreshAll: 'Refresh All', alerts: 'Alerts' },
            archive: { title: 'Historical Archive', search: 'Search snapshots…', compareCurrent: 'vs Current' },
            auth: { createAccount: 'Create Account', signIn: 'Sign In', email: 'Email', password: 'Password', name: 'Name' },
            tier: {
                free: 'Free', unlocked: 'Unlocked', institutional: 'Institutional',
                unlock: 'Unlock Full Report', signUpFree: 'Sign Up Free →',
            },
            credits: { balance: '{{count}} cr', low: 'Low credits', purchase: 'Purchase Credits' },
            common: { loading: 'Loading…', error: 'Something went wrong.', dismiss: 'Dismiss', back: 'Back', next: 'Next', finish: 'Finish' },
        },
    },
    es: {
        translation: {
            nav: { home: 'Inicio', watchlist: 'Watchlist', archive: 'Archivo', screener: 'Filtro', methodology: 'Metodología', settings: 'Ajustes', signIn: 'Iniciar sesión', signUp: 'Registrarse', signOut: 'Cerrar sesión' },
            hero: { headline: 'Investigación Cuantitativa de Grado Institucional', subheadline: 'Señales de IA en momentum, riesgo, sentimiento y estrategia.', placeholder: 'Ticker, empresa, cripto, materia prima…', popular: 'Popular:', generateReport: 'Generar informe →', viewReport: 'Ver informe actual →', compare: 'Comparar dos activos', liveActivity: 'En vivo' },
            report: { generating: 'Analizando {{ticker}}…', complete: 'Análisis completo', signals: '{{count}} señales procesadas', sharedReport: '✓ Informe compartido', reportId: 'ID de informe', generatedAt: 'Generado', researchers: 'investigadores', viewFull: 'Ver informe completo ↓', subscribe: 'Suscribirse a {{ticker}}', nextRefresh: 'Próxima actualización: {{hours}}h' },
            sections: { sectionA: 'Sección A — Resumen de señales', sectionB: 'Sección B — Análisis técnico', sectionC: 'Sección C — Análisis fundamental', sectionD: 'Sección D — Estrategia', sectionE: 'Sección E — Módulos avanzados' },
            watchlist: { title: 'Watchlist', refreshAll: 'Actualizar todo', alerts: 'Alertas' },
            archive: { title: 'Archivo histórico', search: 'Buscar…', compareCurrent: 'vs Actual' },
            auth: { createAccount: 'Crear cuenta', signIn: 'Iniciar sesión', email: 'Correo', password: 'Contraseña', name: 'Nombre' },
            tier: { free: 'Gratis', unlocked: 'Desbloqueado', institutional: 'Institucional', unlock: 'Desbloquear informe completo', signUpFree: 'Registrarse gratis →' },
            credits: { balance: '{{count}} cr', low: 'Créditos bajos', purchase: 'Comprar créditos' },
            common: { loading: 'Cargando…', error: 'Algo salió mal.', dismiss: 'Cerrar', back: 'Atrás', next: 'Siguiente', finish: 'Finalizar' },
        },
    },
    fr: {
        translation: {
            nav: { home: 'Accueil', watchlist: 'Watchlist', archive: 'Archive', screener: 'Filtre', methodology: 'Méthodologie', settings: 'Paramètres', signIn: 'Connexion', signUp: "S'inscrire", signOut: 'Déconnexion' },
            hero: { headline: 'Recherche Quantitative Institutionnelle', subheadline: 'Signaux IA en momentum, risque, sentiment et stratégie.', placeholder: 'Ticker, entreprise, crypto, matière première…', popular: 'Populaire :', generateReport: 'Générer le rapport →', viewReport: 'Voir le rapport →', compare: 'Comparer deux actifs', liveActivity: 'En direct' },
            report: { generating: 'Analyse de {{ticker}}…', complete: 'Analyse terminée', signals: '{{count}} signaux traités', sharedReport: '✓ Rapport partagé', reportId: 'ID de rapport', generatedAt: 'Généré', researchers: 'chercheurs', viewFull: 'Voir le rapport complet ↓', subscribe: 'Sʼabonner à {{ticker}}', nextRefresh: 'Prochaine actualisation : {{hours}}h' },
            sections: { sectionA: 'Section A — Résumé des signaux', sectionB: 'Section B — Analyse technique', sectionC: 'Section C — Analyse fondamentale', sectionD: 'Section D — Stratégie', sectionE: 'Section E — Modules approfondis' },
            watchlist: { title: 'Watchlist', refreshAll: 'Tout actualiser', alerts: 'Alertes' },
            archive: { title: 'Archive historique', search: 'Rechercher…', compareCurrent: 'vs Actuel' },
            auth: { createAccount: 'Créer un compte', signIn: 'Connexion', email: 'E-mail', password: 'Mot de passe', name: 'Nom' },
            tier: { free: 'Gratuit', unlocked: 'Débloqué', institutional: 'Institutionnel', unlock: 'Débloquer le rapport complet', signUpFree: "S'inscrire gratuitement →" },
            credits: { balance: '{{count}} cr', low: 'Crédits faibles', purchase: 'Acheter des crédits' },
            common: { loading: 'Chargement…', error: 'Une erreur est survenue.', dismiss: 'Fermer', back: 'Retour', next: 'Suivant', finish: 'Terminer' },
        },
    },
    de: {
        translation: {
            nav: { home: 'Startseite', watchlist: 'Watchlist', archive: 'Archiv', screener: 'Screener', methodology: 'Methodik', settings: 'Einstellungen', signIn: 'Anmelden', signUp: 'Registrieren', signOut: 'Abmelden' },
            hero: { headline: 'Institutionelle Quantitative Forschung', subheadline: 'KI-gestützte Signale in Momentum, Risiko, Sentiment und Strategie.', placeholder: 'Ticker, Unternehmen, Krypto, Rohstoff…', popular: 'Beliebt:', generateReport: 'Bericht erstellen →', viewReport: 'Aktuellen Bericht ansehen →', compare: 'Zwei Assets vergleichen', liveActivity: 'Live' },
            report: { generating: '{{ticker}} wird analysiert…', complete: 'Analyse abgeschlossen', signals: '{{count}} Signale verarbeitet', sharedReport: '✓ Geteilter Bericht', reportId: 'Bericht-ID', generatedAt: 'Erstellt', researchers: 'Analysten', viewFull: 'Vollständigen Bericht ansehen ↓', subscribe: '{{ticker}}-Updates abonnieren', nextRefresh: 'Nächste Aktualisierung: {{hours}}h' },
            sections: { sectionA: 'Abschnitt A — Signalzusammenfassung', sectionB: 'Abschnitt B — Technische Analyse', sectionC: 'Abschnitt C — Fundamentalanalyse', sectionD: 'Abschnitt D — Strategie', sectionE: 'Abschnitt E — Vertiefungsmodule' },
            watchlist: { title: 'Watchlist', refreshAll: 'Alle aktualisieren', alerts: 'Benachrichtigungen' },
            archive: { title: 'Historisches Archiv', search: 'Suchen…', compareCurrent: 'vs. Aktuell' },
            auth: { createAccount: 'Konto erstellen', signIn: 'Anmelden', email: 'E-Mail', password: 'Passwort', name: 'Name' },
            tier: { free: 'Kostenlos', unlocked: 'Freigeschaltet', institutional: 'Institutionell', unlock: 'Vollständigen Bericht freischalten', signUpFree: 'Kostenlos registrieren →' },
            credits: { balance: '{{count}} Cr.', low: 'Wenig Guthaben', purchase: 'Guthaben kaufen' },
            common: { loading: 'Wird geladen…', error: 'Etwas ist schiefgelaufen.', dismiss: 'Schließen', back: 'Zurück', next: 'Weiter', finish: 'Fertigstellen' },
        },
    },
    pt: {
        translation: {
            nav: { home: 'Início', watchlist: 'Watchlist', archive: 'Arquivo', screener: 'Filtro', methodology: 'Metodologia', settings: 'Configurações', signIn: 'Entrar', signUp: 'Cadastrar', signOut: 'Sair' },
            hero: { headline: 'Pesquisa Quantitativa Institucional', subheadline: 'Sinais de IA em momentum, risco, sentimento e estratégia.', placeholder: 'Ticker, empresa, cripto, commodities…', popular: 'Popular:', generateReport: 'Gerar relatório →', viewReport: 'Ver relatório atual →', compare: 'Comparar dois ativos', liveActivity: 'Ao vivo' },
            report: { generating: 'Analisando {{ticker}}…', complete: 'Análise concluída', signals: '{{count}} sinais processados', sharedReport: '✓ Relatório compartilhado', reportId: 'ID do relatório', generatedAt: 'Gerado', researchers: 'pesquisadores', viewFull: 'Ver relatório completo ↓', subscribe: 'Assinar atualizações de {{ticker}}', nextRefresh: 'Próxima atualização: {{hours}}h' },
            sections: { sectionA: 'Seção A — Resumo de sinais', sectionB: 'Seção B — Análise técnica', sectionC: 'Seção C — Análise fundamentalista', sectionD: 'Seção D — Estratégia', sectionE: 'Seção E — Módulos avançados' },
            watchlist: { title: 'Watchlist', refreshAll: 'Atualizar tudo', alerts: 'Alertas' },
            archive: { title: 'Arquivo histórico', search: 'Pesquisar…', compareCurrent: 'vs Atual' },
            auth: { createAccount: 'Criar conta', signIn: 'Entrar', email: 'E-mail', password: 'Senha', name: 'Nome' },
            tier: { free: 'Gratuito', unlocked: 'Desbloqueado', institutional: 'Institucional', unlock: 'Desbloquear relatório completo', signUpFree: 'Cadastrar gratuitamente →' },
            credits: { balance: '{{count}} cr', low: 'Créditos baixos', purchase: 'Comprar créditos' },
            common: { loading: 'Carregando…', error: 'Algo deu errado.', dismiss: 'Fechar', back: 'Voltar', next: 'Próximo', finish: 'Concluir' },
        },
    },
    ja: {
        translation: {
            nav: { home: 'ホーム', watchlist: 'ウォッチリスト', archive: 'アーカイブ', screener: 'スクリーナー', methodology: '方法論', settings: '設定', signIn: 'ログイン', signUp: '登録', signOut: 'ログアウト' },
            hero: { headline: '機関投資家グレードの定量的調査', subheadline: 'モメンタム・リスク・センチメント・ストラテジーにわたるAIシグナル。', placeholder: 'ティッカー、企業、クリプト、コモディティ…', popular: '人気：', generateReport: 'レポートを生成 →', viewReport: '現在のレポートを見る →', compare: '2つの資産を比較', liveActivity: 'ライブ' },
            report: { generating: '{{ticker}} を分析中…', complete: '分析完了', signals: '{{count}} のシグナルを処理', sharedReport: '✓ 共有レポート', reportId: 'レポートID', generatedAt: '生成日時', researchers: '人のアナリスト', viewFull: '全レポートを表示 ↓', subscribe: '{{ticker}} の更新を購読', nextRefresh: '次の更新：{{hours}}時間後' },
            sections: { sectionA: 'セクションA — シグナル概要', sectionB: 'セクションB — テクニカル分析', sectionC: 'セクションC — ファンダメンタル分析', sectionD: 'セクションD — 戦略', sectionE: 'セクションE — 詳細モジュール' },
            watchlist: { title: 'ウォッチリスト', refreshAll: 'すべて更新', alerts: 'アラート' },
            archive: { title: '過去のレポート', search: '検索…', compareCurrent: '現在と比較' },
            auth: { createAccount: 'アカウント作成', signIn: 'ログイン', email: 'メール', password: 'パスワード', name: '名前' },
            tier: { free: '無料', unlocked: 'アンロック', institutional: '機関', unlock: 'フルレポートを解除', signUpFree: '無料で登録 →' },
            credits: { balance: '{{count}} cr', low: 'クレジット不足', purchase: 'クレジットを購入' },
            common: { loading: '読み込み中…', error: 'エラーが発生しました。', dismiss: '閉じる', back: '戻る', next: '次へ', finish: '完了' },
        },
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('quantus_lang') ?? 'en',
        fallbackLng: 'en',
        interpolation: { escapeValue: false },  // React already escapes
        ns: ['translation'],
        defaultNS: 'translation',
    });

// Persist language change
i18n.on('languageChanged', (lng: string) => {
    localStorage.setItem('quantus_lang', lng);
    document.documentElement.lang = lng;
});

export default i18n;
export const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
] as const;
