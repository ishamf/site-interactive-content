import appCss from './app.css?inline'

const appStyles = new CSSStyleSheet()

appStyles.replaceSync(appCss)

export default appStyles