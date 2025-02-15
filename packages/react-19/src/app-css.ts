import appCss from './App.css?inline';

const appStyles = new CSSStyleSheet();

appStyles.replaceSync(appCss);

export default appStyles;
