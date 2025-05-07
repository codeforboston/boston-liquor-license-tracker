import { FormattedMessage } from "react-intl";
import "./App.css";
import LangSwitcher from "./i18n/lang-switcher";

function App() {
  return (
    <>
      <div className="App">
        <LangSwitcher />
        <FormattedMessage id="example.intro"></FormattedMessage>
      </div>
    </>
  );
}

export default App;
