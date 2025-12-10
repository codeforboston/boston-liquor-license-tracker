import NavigationButton from "./navigation-button";

const Navigation = () => {
  return (
    <nav 
      className={`
        navigation
        flex flex-wrap 
        flex-col md:flex-row
        justify-center items-stretch md:items-start
        py-[16px] px-[24px]
        md:py-[48px] md:px-[64px]  
        gap-[16px] md:gap-[56px] last:mb-0
      `}
    >
      <NavigationButton to="/maps" messageId="shared.map.capitalized"/>
      <NavigationButton to="/database" messageId="shared.database.capitalized"/>
      <NavigationButton to="/resources" messageId="shared.resources.capitalized"/>
    </nav>
  );
};

export default Navigation
