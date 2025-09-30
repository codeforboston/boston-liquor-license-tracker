import navigationStyles from "./navigation.module.css"
import NavigationButton from './navigation-button';

const Navigation = () => {
  return (
    <div 
      className={`
        ${navigationStyles.navigation}
        navigation
        flex flex-wrap 
        justify-center items-start 
        py-[48px] px-[64px] 
        gap-[56px] last:mb-0
      `}
    >
      <NavigationButton to='/maps' messageId='navigation.maps'/>
      <NavigationButton to='/database' messageId='navigation.database'/>
      <NavigationButton to='/resources' messageId='ui.resources'/>
    </div>
  );
};

export default Navigation
