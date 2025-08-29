// import React from "react";
// import PropTypes from "prop-types";
// import { connect } from "react-redux";
// import { withRouter } from "react-router-dom";
// import s from "./Sidebar.module.scss";
// import LinksGroup from "./LinksGroup/LinksGroup";
// import { changeActiveSidebarItem } from "../../actions/navigation";
// import { logoutUser } from "../../actions/auth";
// import cx from "classnames";

// // white sidebar
// import lightDashboardIcon from "../../images/theme-icons/yellow/Dashboard_outlined.svg";
// import darkDashboardIcon from "../../images/theme-icons/yellow/Dashboard_filled.svg";
// import lightUI from "../../images/ui-elements.svg";
// import darkUI from "../../images/ui-elements-dark.svg";
// import logo from "../../images/logo.svg";
// import AJIN_logo_white_background from "../../images/AJIN_logo_white_background_gray.png"
// import settingsOutlined from "../../images/theme-icons/yellow/Settings_outlined.svg";
// import settingsFilled from "../../images/theme-icons/yellow/Settings_outlined.svg";
// import logoutIcon from "../../images/logout.svg";
// import eCommerceOutlined from "../../images/theme-icons/yellow/E-commerce_outlined.svg";
// import eCommerceFilled from "../../images/theme-icons/yellow/E-commerce_filled.svg";
// import packageOutlined from "../../images/theme-icons/yellow/Package_outlined.svg";
// import packageFilled from "../../images/theme-icons/yellow/Package_filled.svg";
// import profileOutlined from "../../images/theme-icons/yellow/Profile_outlined.svg";
// import profileFilled from "../../images/theme-icons/yellow/Profile_filled.svg";
// import emailOutlined from "../../images/theme-icons/yellow/Email_outlined.svg";
// import emailFilled from "../../images/theme-icons/yellow/Email_filled.svg";
// import documentationOutlined from "../../images/theme-icons/yellow/Documentation_outlined.svg";
// import documentationFilled from "../../images/theme-icons/yellow/Documentation_filled.svg";
// import coreOutlined from "../../images/theme-icons/yellow/Core_outlined.svg";
// import coreFilled from "../../images/theme-icons/yellow/Core_filled.svg";
// import formsOutlined from "../../images/theme-icons/yellow/Forms_outlined.svg";
// import formsFilled from "../../images/theme-icons/yellow/Forms_filled.svg";
// import chartsOutlined from "../../images/theme-icons/yellow/Charts_outlined.svg";
// import chartsFilled from "../../images/theme-icons/yellow/Charts_filled.svg";
// import gridOutlined from "../../images/theme-icons/yellow/Grid_outlined.svg";
// import gridFilled from "../../images/theme-icons/yellow/Grid_filled.svg";
// import tablesOutlined from "../../images/theme-icons/yellow/Tables_outlined.svg";
// import tablesFilled from "../../images/theme-icons/yellow/Tables_filled.svg";
// import mapsOutlined from "../../images/theme-icons/yellow/Maps_outlined.svg";
// import mapsFilled from "../../images/theme-icons/yellow/Maps_filled.svg";
// import extraOutlined from "../../images/light-extra.svg";
// import extraFilled from "../../images/dark-extra.svg";

// // danger
// import lightDashboardIconDanger from "../../images/theme-icons/red/Dashboard_outlined.svg";
// import darkDashboardIconDanger from "../../images/theme-icons/red/Dashboard_filled.svg";
// import lightUIDanger from "../../images/theme-icons/red/ui elements_outlined.svg";
// import darkUIDanger from "../../images/theme-icons/red/ui elements_filled.svg";
// import logoDanger from "../../images/theme-icons/red/Logo.svg";
// import settingsOutlinedDanger from "../../images/theme-icons/red/Settings_outlined.svg";
// import settingsFilledDanger from "../../images/theme-icons/red/Settings_outlined.svg";
// import logoutIconDanger from "../../images/theme-icons/red/Logout_outlined.svg";
// import eCommerceOutlinedDanger from "../../images/theme-icons/red/E-commerce_outlined.svg";
// import eCommerceFilledDanger from "../../images/theme-icons/red/E-commerce_filled.svg";
// import packageOutlinedDanger from "../../images/theme-icons/red/Package_outlined.svg";
// import packageFilledDanger from "../../images/theme-icons/red/Package_filled.svg";
// import profileOutlinedDanger from "../../images/theme-icons/red/Profile_outlined.svg";
// import profileFilledDanger from "../../images/theme-icons/red/Profile_filled.svg";
// import emailOutlinedDanger from "../../images/theme-icons/red/Email_outlined.svg";
// import emailFilledDanger from "../../images/theme-icons/red/Email_filled.svg";
// import documentationOutlinedDanger from "../../images/theme-icons/red/Documentation_outlined.svg";
// import documentationFilledDanger from "../../images/theme-icons/red/Documentation_filled.svg";
// import coreOutlinedDanger from "../../images/theme-icons/red/Core_outlined.svg";
// import coreFilledDanger from "../../images/theme-icons/red/Core_filled.svg";
// import formsOutlinedDanger from "../../images/theme-icons/red/Forms_outlined.svg";
// import formsFilledDanger from "../../images/theme-icons/red/Forms_filled.svg";
// import chartsOutlinedDanger from "../../images/theme-icons/red/Charts_outlined.svg";
// import chartsFilledDanger from "../../images/theme-icons/red/Charts_filled.svg";
// import gridOutlinedDanger from "../../images/theme-icons/red/Grid_outlined.svg";
// import gridFilledDanger from "../../images/theme-icons/red/Grid_filled.svg";
// import tablesOutlinedDanger from "../../images/theme-icons/red/Tables_outlined.svg";
// import tablesFilledDanger from "../../images/theme-icons/red/Tables_filled.svg";
// import mapsOutlinedDanger from "../../images/theme-icons/red/Maps_outlined.svg";
// import mapsFilledDanger from "../../images/theme-icons/red/Maps_filled.svg";
// import extraOutlinedDanger from "../../images/theme-icons/red/Extra_outlined.svg";
// import extraFilledDanger from "../../images/theme-icons/red/Extra_filled.svg";

// // success
// import lightDashboardIconSuccess from "../../images/theme-icons/green/Dashboard_outlined.svg";
// import darkDashboardIconSuccess from "../../images/theme-icons/green/Dashboard_filled.svg";
// import lightUISuccess from "../../images/theme-icons/green/ui elements_outlined.svg";
// import darkUISuccess from "../../images/theme-icons/green/ui elements_filled.svg";
// import logoSuccess from "../../images/theme-icons/green/Logo.svg";
// import settingsOutlinedSuccess from "../../images/theme-icons/green/Settings_outlined.svg";
// import settingsFilledSuccess from "../../images/theme-icons/green/Settings_outlined.svg";
// import logoutIconSuccess from "../../images/theme-icons/green/Logout_outlined.svg";
// import eCommerceOutlinedSuccess from "../../images/theme-icons/green/E-commerce_outlined.svg";
// import eCommerceFilledSuccess from "../../images/theme-icons/green/E-commerce_filled.svg";
// import packageOutlinedSuccess from "../../images/theme-icons/green/Package_outlined.svg";
// import packageFilledSuccess from "../../images/theme-icons/green/Package_filled.svg";
// import profileOutlinedSuccess from "../../images/theme-icons/green/Profile_outlined.svg";
// import profileFilledSuccess from "../../images/theme-icons/green/Profile_filled.svg";
// import emailOutlinedSuccess from "../../images/theme-icons/green/Email_outlined.svg";
// import emailFilledSuccess from "../../images/theme-icons/green/Email_filled.svg";
// import documentationOutlinedSuccess from "../../images/theme-icons/green/Documentation_outlined.svg";
// import documentationFilledSuccess from "../../images/theme-icons/green/Documentation_filled.svg";
// import coreOutlinedSuccess from "../../images/theme-icons/green/Core_outlined.svg";
// import coreFilledSuccess from "../../images/theme-icons/green/Core_filled.svg";
// import formsOutlinedSuccess from "../../images/theme-icons/green/Forms_outlined.svg";
// import formsFilledSuccess from "../../images/theme-icons/green/Forms_filled.svg";
// import chartsOutlinedSuccess from "../../images/theme-icons/green/Charts_outlined.svg";
// import chartsFilledSuccess from "../../images/theme-icons/green/Charts_filled.svg";
// import gridOutlinedSuccess from "../../images/theme-icons/green/Grid_outlined.svg";
// import gridFilledSuccess from "../../images/theme-icons/green/Grid_filled.svg";
// import tablesOutlinedSuccess from "../../images/theme-icons/green/Tables_outlined.svg";
// import tablesFilledSuccess from "../../images/theme-icons/green/Tables_filled.svg";
// import mapsOutlinedSuccess from "../../images/theme-icons/green/Maps_outlined.svg";
// import mapsFilledSuccess from "../../images/theme-icons/green/Maps_filled.svg";
// import extraOutlinedSuccess from "../../images/theme-icons/green/Extra_outlined.svg";
// import extraFilledSuccess from "../../images/theme-icons/green/Extra_filled.svg";

// // info
// import lightDashboardIconBlue from "../../images/theme-icons/blue/Dashboard_outlined.svg";
// import darkDashboardIconBlue from "../../images/theme-icons/blue/Dashboard_filled.svg";
// import lightUIBlue from "../../images/theme-icons/blue/ui elements_outlined.svg";
// import darkUIBlue from "../../images/theme-icons/blue/ui elements_filled.svg";
// import logoBlue from "../../images/theme-icons/blue/Logo.svg";
// import settingsOutlinedBlue from "../../images/theme-icons/blue/Settings_outlined.svg";
// import settingsFilledBlue from "../../images/theme-icons/blue/Settings_outlined.svg";
// import logoutIconBlue from "../../images/theme-icons/blue/Logout_outlined.svg";
// import eCommerceOutlinedBlue from "../../images/theme-icons/blue/E-commerce_outlined.svg";
// import eCommerceFilledBlue from "../../images/theme-icons/blue/E-commerce_filled.svg";
// import packageOutlinedBlue from "../../images/theme-icons/blue/Package_outlined.svg";
// import packageFilledBlue from "../../images/theme-icons/blue/Package_filled.svg";
// import profileOutlinedBlue from "../../images/theme-icons/blue/Profile_outlined.svg";
// import profileFilledBlue from "../../images/theme-icons/blue/Profile_filled.svg";
// import emailOutlinedBlue from "../../images/theme-icons/blue/Email_outlined.svg";
// import emailFilledBlue from "../../images/theme-icons/blue/Email_filled.svg";
// import documentationOutlinedBlue from "../../images/theme-icons/blue/Documentation_outlined.svg";
// import documentationFilledBlue from "../../images/theme-icons/blue/Documentation_filled.svg";
// import coreOutlinedBlue from "../../images/theme-icons/blue/Core_outlined.svg";
// import coreFilledBlue from "../../images/theme-icons/blue/Core_filled.svg";
// import formsOutlinedBlue from "../../images/theme-icons/blue/Forms_outlined.svg";
// import formsFilledBlue from "../../images/theme-icons/blue/Forms_filled.svg";
// import chartsOutlinedBlue from "../../images/theme-icons/blue/Charts_outlined.svg";
// import chartsFilledBlue from "../../images/theme-icons/blue/Charts_filled.svg";
// import gridOutlinedBlue from "../../images/theme-icons/blue/Grid_outlined.svg";
// import gridFilledBlue from "../../images/theme-icons/blue/Grid_filled.svg";
// import tablesOutlinedBlue from "../../images/theme-icons/blue/Tables_outlined.svg";
// import tablesFilledBlue from "../../images/theme-icons/blue/Tables_filled.svg";
// import mapsOutlinedBlue from "../../images/theme-icons/blue/Maps_outlined.svg";
// import mapsFilledBlue from "../../images/theme-icons/blue/Maps_filled.svg";
// import extraOutlinedBlue from "../../images/theme-icons/blue/Extra_outlined.svg";
// import extraFilledBlue from "../../images/theme-icons/blue/Extra_filled.svg";

// //dark sidebar
// import darkSidebarDashboardOutlined from "../../images/theme-icons/dark sidebar/yellow/Dashboard_outlined.svg";
// import darkSidebarDashboardFilled from "../../images/theme-icons/dark sidebar/yellow/Dashboard_filled.svg";
// import darkSidebarTablesOutlined from "../../images/theme-icons/dark sidebar/yellow/Tables_outlined.svg";
// import darkSidebarTablesFilled from "../../images/theme-icons/dark sidebar/yellow/Tables_filled.svg";
// import darkSidebarUIOutlined from "../../images/theme-icons/dark sidebar/yellow/ui elements_outlined.svg";
// import darkSidebarUIFilled from "../../images/theme-icons/dark sidebar/yellow/ui elements_filled.svg";
// import darkSidebarSettingsOutlined from "../../images/theme-icons/dark sidebar/yellow/Settings_outlined.svg";
// import darkSidebarSettingsFilled from "../../images/theme-icons/dark sidebar/yellow/Settings_filled.svg";
// import darkSidebarLogout from "../../images/theme-icons/dark sidebar/yellow/Logout_outlined.svg";
// import darkSidebarAccountOutlined from "../../images/theme-icons/dark sidebar/yellow/Profile_outlined.svg";
// import darkSidebarAccountFilled from "../../images/theme-icons/dark sidebar/yellow/Profile_filled.svg";
// import darkSidebarEcommerceOutlined from "../../images/theme-icons/dark sidebar/yellow/E-commerce_outlined.svg";
// import darkSidebarEcommerceFilled from "../../images/theme-icons/dark sidebar/yellow/E-commerce_filled.svg";
// import darkSidebarPackageOutlined from "../../images/theme-icons/dark sidebar/yellow/Package_outlined.svg";
// import darkSidebarPackageFilled from "../../images/theme-icons/dark sidebar/yellow/Package_filled.svg";
// import darkSidebarEmailOutlined from "../../images/theme-icons/dark sidebar/yellow/Email_outlined.svg";
// import darkSidebarEmailFilled from "../../images/theme-icons/dark sidebar/yellow/Email_filled.svg";
// import darkSidebarDocumentationOutlined from "../../images/theme-icons/dark sidebar/yellow/Documentation_outlined.svg";
// import darkSidebarDocumentationFilled from "../../images/theme-icons/dark sidebar/yellow/Documentation_filled.svg";
// import darkSidebarCoreOutlined from "../../images/theme-icons/dark sidebar/yellow/Core_outlined.svg";
// import darkSidebarCoreFilled from "../../images/theme-icons/dark sidebar/yellow/Core_filled.svg";
// import darkSidebarFormsOutlined from "../../images/theme-icons/dark sidebar/yellow/Forms_outlined.svg";
// import darkSidebarFormsFilled from "../../images/theme-icons/dark sidebar/yellow/Forms_filled.svg";
// import darkSidebarChartsOutlined from "../../images/theme-icons/dark sidebar/yellow/Charts_outlined.svg";
// import darkSidebarChartsFilled from "../../images/theme-icons/dark sidebar/yellow/Charts_filled.svg";
// import darkSidebarGridOutlined from "../../images/theme-icons/dark sidebar/yellow/Grid_outlined.svg";
// import darkSidebarGridFilled from "../../images/theme-icons/dark sidebar/yellow/Grid_filled.svg";
// import darkSidebarMapsOutlined from "../../images/theme-icons/dark sidebar/yellow/Maps_outlined.svg";
// import darkSidebarMapsFilled from "../../images/theme-icons/dark sidebar/yellow/Maps_filled.svg";
// import darkSidebarExtraOutlined from "../../images/theme-icons/dark sidebar/yellow/Extra_outlined.svg";
// import darkSidebarExtraFilled from "../../images/theme-icons/dark sidebar/yellow/Extra_filled.svg";

// //dark sidebar danger
// import darkSidebarDashboardOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Dashboard_outlined.svg";
// import darkSidebarDashboardFilledDanger from "../../images/theme-icons/dark sidebar/red/Dashboard_filled.svg";
// import darkSidebarTablesOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Tables_outlined.svg";
// import darkSidebarTablesFilledDanger from "../../images/theme-icons/dark sidebar/red/Tables_filled.svg";
// import darkSidebarUIOutlinedDanger from "../../images/theme-icons/dark sidebar/red/ui elements_outlined.svg";
// import darkSidebarUIFilledDanger from "../../images/theme-icons/dark sidebar/red/ui elements_filled.svg";
// import darkSidebarSettingsOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Settings_outlined.svg";
// import darkSidebarSettingsFilledDanger from "../../images/theme-icons/dark sidebar/red/Settings_filled.svg";
// import darkSidebarLogoutDanger from "../../images/theme-icons/dark sidebar/red/Logout_outlined.svg";
// import darkSidebarAccountOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Profile_outlined.svg";
// import darkSidebarAccountFilledDanger from "../../images/theme-icons/dark sidebar/red/Profile_filled.svg";
// import darkSidebarEcommerceOutlinedDanger from "../../images/theme-icons/dark sidebar/red/E-commerce_outlined.svg";
// import darkSidebarEcommerceFilledDanger from "../../images/theme-icons/dark sidebar/red/E-commerce_filled.svg";
// import darkSidebarPackageOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Package_outlined.svg";
// import darkSidebarPackageFilledDanger from "../../images/theme-icons/dark sidebar/red/Package_filled.svg";
// import darkSidebarEmailOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Email_outlined.svg";
// import darkSidebarEmailFilledDanger from "../../images/theme-icons/dark sidebar/red/Email_filled.svg";
// import darkSidebarDocumentationOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Documentation_outlined.svg";
// import darkSidebarDocumentationFilledDanger from "../../images/theme-icons/dark sidebar/red/Documentation_filled.svg";
// import darkSidebarCoreOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Core_outlined.svg";
// import darkSidebarCoreFilledDanger from "../../images/theme-icons/dark sidebar/red/Core_filled.svg";
// import darkSidebarFormsOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Forms_outlined.svg";
// import darkSidebarFormsFilledDanger from "../../images/theme-icons/dark sidebar/red/Forms_filled.svg";
// import darkSidebarChartsOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Charts_outlined.svg";
// import darkSidebarChartsFilledDanger from "../../images/theme-icons/dark sidebar/red/Charts_filled.svg";
// import darkSidebarGridOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Grid_outlined.svg";
// import darkSidebarGridFilledDanger from "../../images/theme-icons/dark sidebar/red/Grid_filled.svg";
// import darkSidebarMapsOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Maps_outlined.svg";
// import darkSidebarMapsFilledDanger from "../../images/theme-icons/dark sidebar/red/Maps_filled.svg";
// import darkSidebarExtraOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Extra_outlined.svg";
// import darkSidebarExtraFilledDanger from "../../images/theme-icons/dark sidebar/red/Extra_filled.svg";

// //dark sidebar success
// import darkSidebarDashboardOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Dashboard_outlined.svg";
// import darkSidebarDashboardFilledSuccess from "../../images/theme-icons/dark sidebar/green/Dashboard_filled.svg";
// import darkSidebarTablesOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Tables_outlined.svg";
// import darkSidebarTablesFilledSuccess from "../../images/theme-icons/dark sidebar/green/Tables_filled.svg";
// import darkSidebarUIOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/ui elements_outlined.svg";
// import darkSidebarUIFilledSuccess from "../../images/theme-icons/dark sidebar/green/ui elements_filled.svg";
// import darkSidebarSettingsOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Settings_outlined.svg";
// import darkSidebarSettingsFilledSuccess from "../../images/theme-icons/dark sidebar/green/Settings_filled.svg";
// import darkSidebarLogoutSuccess from "../../images/theme-icons/dark sidebar/green/Logout_outlined.svg";
// import darkSidebarAccountOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Profile_outlined.svg";
// import darkSidebarAccountFilledSuccess from "../../images/theme-icons/dark sidebar/green/Profile_filled.svg";
// import darkSidebarEcommerceOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/E-commerce_outlined.svg";
// import darkSidebarEcommerceFilledSuccess from "../../images/theme-icons/dark sidebar/green/E-commerce_filled.svg";
// import darkSidebarPackageOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Package_outlined.svg";
// import darkSidebarPackageFilledSuccess from "../../images/theme-icons/dark sidebar/green/Package_filled.svg";
// import darkSidebarEmailOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Email_outlined.svg";
// import darkSidebarEmailFilledSuccess from "../../images/theme-icons/dark sidebar/green/Email_filled.svg";
// import darkSidebarDocumentationOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Documentation_outlined.svg";
// import darkSidebarDocumentationFilledSuccess from "../../images/theme-icons/dark sidebar/green/Documentation_filled.svg";
// import darkSidebarCoreOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Core_outlined.svg";
// import darkSidebarCoreFilledSuccess from "../../images/theme-icons/dark sidebar/green/Core_filled.svg";
// import darkSidebarFormsOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Forms_outlined.svg";
// import darkSidebarFormsFilledSuccess from "../../images/theme-icons/dark sidebar/green/Forms_filled.svg";
// import darkSidebarChartsOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Charts_outlined.svg";
// import darkSidebarChartsFilledSuccess from "../../images/theme-icons/dark sidebar/green/Charts_filled.svg";
// import darkSidebarGridOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Grid_outlined.svg";
// import darkSidebarGridFilledSuccess from "../../images/theme-icons/dark sidebar/green/Grid_filled.svg";
// import darkSidebarMapsOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Maps_outlined.svg";
// import darkSidebarMapsFilledSuccess from "../../images/theme-icons/dark sidebar/green/Maps_filled.svg";
// import darkSidebarExtraOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Extra_outlined.svg";
// import darkSidebarExtraFilledSuccess from "../../images/theme-icons/dark sidebar/green/Extra_filled.svg";

// //dark sidebar info
// import darkSidebarDashboardOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Dashboard_outlined.svg";
// import darkSidebarDashboardFilledBlue from "../../images/theme-icons/dark sidebar/blue/Dashboard_filled.svg";
// import darkSidebarTablesOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Tables_outlined.svg";
// import darkSidebarTablesFilledBlue from "../../images/theme-icons/dark sidebar/blue/Tables_filled.svg";
// import darkSidebarUIOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/ui elements_outlined.svg";
// import darkSidebarUIFilledBlue from "../../images/theme-icons/dark sidebar/blue/ui elements_filled.svg";
// import darkSidebarSettingsOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Settings_outlined.svg";
// import darkSidebarSettingsFilledBlue from "../../images/theme-icons/dark sidebar/blue/Settings_filled.svg";
// import darkSidebarLogoutBlue from "../../images/theme-icons/dark sidebar/blue/Logout_outlined.svg";
// import darkSidebarAccountOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Profile_outlined.svg";
// import darkSidebarAccountFilledBlue from "../../images/theme-icons/dark sidebar/blue/Profile_filled.svg";
// import darkSidebarEcommerceOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/E-commerce_outlined.svg";
// import darkSidebarEcommerceFilledBlue from "../../images/theme-icons/dark sidebar/blue/E-commerce_filled.svg";
// import darkSidebarPackageOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Package_outlined.svg";
// import darkSidebarPackageFilledBlue from "../../images/theme-icons/dark sidebar/blue/Package_filled.svg";
// import darkSidebarEmailOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Email_outlined.svg";
// import darkSidebarEmailFilledBlue from "../../images/theme-icons/dark sidebar/blue/Email_filled.svg";
// import darkSidebarDocumentationOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Documentation_outlined.svg";
// import darkSidebarDocumentationFilledBlue from "../../images/theme-icons/dark sidebar/blue/Documentation_filled.svg";
// import darkSidebarCoreOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Core_outlined.svg";
// import darkSidebarCoreFilledBlue from "../../images/theme-icons/dark sidebar/blue/Core_filled.svg";
// import darkSidebarFormsOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Forms_outlined.svg";
// import darkSidebarFormsFilledBlue from "../../images/theme-icons/dark sidebar/blue/Forms_filled.svg";
// import darkSidebarChartsOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Charts_outlined.svg";
// import darkSidebarChartsFilledBlue from "../../images/theme-icons/dark sidebar/blue/Charts_filled.svg";
// import darkSidebarGridOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Grid_outlined.svg";
// import darkSidebarGridFilledBlue from "../../images/theme-icons/dark sidebar/blue/Grid_filled.svg";
// import darkSidebarMapsOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Maps_outlined.svg";
// import darkSidebarMapsFilledBlue from "../../images/theme-icons/dark sidebar/blue/Maps_filled.svg";
// import darkSidebarExtraOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Extra_outlined.svg";
// import darkSidebarExtraFilledBlue from "../../images/theme-icons/dark sidebar/blue/Extra_filled.svg";

// class Sidebar extends React.Component {
//   static propTypes = {
//     sidebarStatic: PropTypes.bool,
//     sidebarOpened: PropTypes.bool,
//     dispatch: PropTypes.func.isRequired,
//     activeItem: PropTypes.string,
//     location: PropTypes.shape({
//       pathname: PropTypes.string,
//     }).isRequired,
//   };

//   static defaultProps = {
//     sidebarStatic: true,
//     sidebarOpened: true,
//     activeItem: "",
//   };

//   constructor(props) {
//     super(props);

//     this.doLogout = this.doLogout.bind(this);
//     this.themeIcons = this.themeIcons.bind(this);
//   }

//   doLogout() {
//     this.props.dispatch(logoutUser());
//   }

//   themeIcons(currentPage) {
//     const sidebarColor = this.props.sidebarColor;
//     if (sidebarColor === "dark") {
//       switch (this.props.themeColor) {
//         case "warning":
//           switch (currentPage) {
//             case "dashboard":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarDashboardFilled
//                 : darkSidebarDashboardOutlined;
//             case "ecommerce":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarEcommerceFilled
//                 : darkSidebarEcommerceOutlined;
//             case "package":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarPackageFilled
//                 : darkSidebarPackageOutlined;
//             case "profile":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarAccountFilled
//                 : darkSidebarAccountOutlined;
//             case "settings":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarSettingsFilled
//                 : darkSidebarSettingsOutlined;
//             case "logout":
//               return darkSidebarLogout;
//             case "email":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarEmailFilled
//                 : darkSidebarEmailOutlined;
//             case "documentation":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarDocumentationFilled
//                 : darkSidebarDocumentationOutlined;
//             case "core":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarCoreFilled
//                 : darkSidebarCoreOutlined;
//             case "ui":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarUIFilled
//                 : darkSidebarUIOutlined;
//             case "forms":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarFormsFilled
//                 : darkSidebarFormsOutlined;
//             case "Charts":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarChartsFilled
//                 : darkSidebarChartsOutlined;
//             case "grid":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarGridFilled
//                 : darkSidebarGridOutlined;
//             case "tables":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarTablesFilled
//                 : darkSidebarTablesOutlined;
//             case "maps":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarMapsFilled
//                 : darkSidebarMapsOutlined;
//             case "extra":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarExtraFilled
//                 : darkSidebarExtraOutlined;
//             default:
//               return;
//           }
//         case "danger":
//           switch (currentPage) {
//             case "dashboard":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarDashboardFilledDanger
//                 : darkSidebarDashboardOutlinedDanger;
//             case "ecommerce":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarEcommerceFilledDanger
//                 : darkSidebarEcommerceOutlinedDanger;
//             case "package":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarPackageFilledDanger
//                 : darkSidebarPackageOutlinedDanger;
//             case "profile":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarAccountFilledDanger
//                 : darkSidebarAccountOutlinedDanger;
//             case "settings":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarSettingsFilledDanger
//                 : darkSidebarSettingsOutlinedDanger;
//             case "logout":
//               return darkSidebarLogoutDanger;
//             case "email":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarEmailFilledDanger
//                 : darkSidebarEmailOutlinedDanger;
//             case "documentation":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarDocumentationFilledDanger
//                 : darkSidebarDocumentationOutlinedDanger;
//             case "core":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarCoreFilledDanger
//                 : darkSidebarCoreOutlinedDanger;
//             case "ui":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarUIFilledDanger
//                 : darkSidebarUIOutlinedDanger;
//             case "forms":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarFormsFilledDanger
//                 : darkSidebarFormsOutlinedDanger;
//             case "charts":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarChartsFilledDanger
//                 : darkSidebarChartsOutlinedDanger;
//             case "grid":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarGridFilledDanger
//                 : darkSidebarGridOutlinedDanger;
//             case "tables":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarTablesFilledDanger
//                 : darkSidebarTablesOutlinedDanger;
//             case "maps":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarMapsFilledDanger
//                 : darkSidebarMapsOutlinedDanger;
//             case "extra":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarExtraFilledDanger
//                 : darkSidebarExtraOutlinedDanger;
//             default:
//               return;
//           }
//         case "success":
//           switch (currentPage) {
//             case "dashboard":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarDashboardFilledSuccess
//                 : darkSidebarDashboardOutlinedSuccess;
//             case "ecommerce":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarEcommerceFilledSuccess
//                 : darkSidebarEcommerceOutlinedSuccess;
//             case "package":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarPackageFilledSuccess
//                 : darkSidebarPackageOutlinedSuccess;
//             case "profile":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarAccountFilledSuccess
//                 : darkSidebarAccountOutlinedSuccess;
//             case "settings":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarSettingsFilledSuccess
//                 : darkSidebarSettingsOutlinedSuccess;
//             case "logout":
//               return darkSidebarLogoutSuccess;
//             case "email":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarEmailFilledSuccess
//                 : darkSidebarEmailOutlinedSuccess;
//             case "documentation":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarDocumentationFilledSuccess
//                 : darkSidebarDocumentationOutlinedSuccess;
//             case "core":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarCoreFilledSuccess
//                 : darkSidebarCoreOutlinedSuccess;
//             case "ui":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarUIFilledSuccess
//                 : darkSidebarUIOutlinedSuccess;
//             case "forms":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarFormsFilledSuccess
//                 : darkSidebarFormsOutlinedSuccess;
//             case "charts":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarChartsFilledSuccess
//                 : darkSidebarChartsOutlinedSuccess;
//             case "grid":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarGridFilledSuccess
//                 : darkSidebarGridOutlinedSuccess;
//             case "tables":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarTablesFilledSuccess
//                 : darkSidebarTablesOutlinedSuccess;
//             case "maps":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarMapsFilledSuccess
//                 : darkSidebarMapsOutlinedSuccess;
//             case "extra":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarExtraFilledSuccess
//                 : darkSidebarExtraOutlinedSuccess;
//             default:
//               return;
//           }
//         case "info":
//           switch (currentPage) {
//             case "dashboard":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarDashboardFilledBlue
//                 : darkSidebarDashboardOutlinedBlue;
//             case "ecommerce":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarEcommerceFilledBlue
//                 : darkSidebarEcommerceOutlinedBlue;
//             case "package":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarPackageFilledBlue
//                 : darkSidebarPackageOutlinedBlue;
//             case "profile":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarAccountFilledBlue
//                 : darkSidebarAccountOutlinedBlue;
//             case "settings":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarSettingsFilledBlue
//                 : darkSidebarSettingsOutlinedBlue;
//             case "logout":
//               return darkSidebarLogoutBlue;
//             case "email":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarEmailFilledBlue
//                 : darkSidebarEmailOutlinedBlue;
//             case "documentation":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarDocumentationFilledBlue
//                 : darkSidebarDocumentationOutlinedBlue;
//             case "core":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarCoreFilledBlue
//                 : darkSidebarCoreOutlinedBlue;
//             case "ui":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarUIFilledBlue
//                 : darkSidebarUIOutlinedBlue;
//             case "forms":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarFormsFilledBlue
//                 : darkSidebarFormsOutlinedBlue;
//             case "charts":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarChartsFilledBlue
//                 : darkSidebarChartsOutlinedBlue;
//             case "grid":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarGridFilledBlue
//                 : darkSidebarGridOutlinedBlue;
//             case "tables":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarTablesFilledBlue
//                 : darkSidebarTablesOutlinedBlue;
//             case "maps":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarMapsFilledBlue
//                 : darkSidebarMapsOutlinedBlue;
//             case "extra":
//               return window.location.href.includes(currentPage)
//                 ? darkSidebarExtraFilledBlue
//                 : darkSidebarExtraOutlinedBlue;
//             default:
//               return;
//           }
//         default:
//           return;
//       }
//     }
//     switch (this.props.themeColor) {
//       case "warning":
//         switch (currentPage) {
//           case "dashboard":
//             return window.location.href.includes(currentPage)
//               ? darkDashboardIcon
//               : lightDashboardIcon;
//           case "ecommerce":
//             return window.location.href.includes(currentPage)
//               ? eCommerceFilled
//               : eCommerceOutlined;
//           case "package":
//             return window.location.href.includes(currentPage)
//               ? packageFilled
//               : packageOutlined;
//           case "profile":
//             return window.location.href.includes(currentPage)
//               ? profileFilled
//               : profileOutlined;
//           case "settings":
//             return window.location.href.includes(currentPage)
//               ? settingsFilled
//               : settingsOutlined;
//           case "logout":
//             return logoutIcon;
//           case "email":
//             return window.location.href.includes(currentPage)
//               ? emailFilled
//               : emailOutlined;
//           case "documentation":
//             return window.location.href.includes(currentPage)
//               ? documentationFilled
//               : documentationOutlined;
//           case "core":
//             return window.location.href.includes(currentPage)
//               ? coreFilled
//               : coreOutlined;
//           case "ui":
//             return window.location.href.includes(currentPage)
//               ? darkUI
//               : lightUI;
//           case "forms":
//             return window.location.href.includes(currentPage)
//               ? formsFilled
//               : formsOutlined;
//           case "charts":
//             return window.location.href.includes(currentPage)
//               ? chartsFilled
//               : chartsOutlined;
//           case "grid":
//             return window.location.href.includes(currentPage)
//               ? gridFilled
//               : gridOutlined;
//           case "tables":
//             return window.location.href.includes(currentPage)
//               ? tablesFilled
//               : tablesOutlined;
//           case "maps":
//             return window.location.href.includes(currentPage)
//               ? mapsFilled
//               : mapsOutlined;
//           case "extra":
//             return window.location.href.includes(currentPage)
//               ? extraFilled
//               : extraOutlined;
//           default:
//             return;
//         }
//       case "danger":
//         switch (currentPage) {
//           case "dashboard":
//             return window.location.href.includes(currentPage)
//               ? darkDashboardIconDanger
//               : lightDashboardIconDanger;
//           case "ecommerce":
//             return window.location.href.includes(currentPage)
//               ? eCommerceFilledDanger
//               : eCommerceOutlinedDanger;
//           case "package":
//             return window.location.href.includes(currentPage)
//               ? packageFilledDanger
//               : packageOutlinedDanger;
//           case "profile":
//             return window.location.href.includes(currentPage)
//               ? profileFilledDanger
//               : profileOutlinedDanger;
//           case "settings":
//             return window.location.href.includes(currentPage)
//               ? settingsFilledDanger
//               : settingsOutlinedDanger;
//           case "logout":
//             return logoutIconDanger;
//           case "email":
//             return window.location.href.includes(currentPage)
//               ? emailFilledDanger
//               : emailOutlinedDanger;
//           case "documentation":
//             return window.location.href.includes(currentPage)
//               ? documentationFilledDanger
//               : documentationOutlinedDanger;
//           case "core":
//             return window.location.href.includes(currentPage)
//               ? coreFilledDanger
//               : coreOutlinedDanger;
//           case "ui":
//             return window.location.href.includes(currentPage)
//               ? darkUIDanger
//               : lightUIDanger;
//           case "forms":
//             return window.location.href.includes(currentPage)
//               ? formsFilledDanger
//               : formsOutlinedDanger;
//           case "charts":
//             return window.location.href.includes(currentPage)
//               ? chartsFilledDanger
//               : chartsOutlinedDanger;
//           case "grid":
//             return window.location.href.includes(currentPage)
//               ? gridFilledDanger
//               : gridOutlinedDanger;
//           case "tables":
//             return window.location.href.includes(currentPage)
//               ? tablesFilledDanger
//               : tablesOutlinedDanger;
//           case "maps":
//             return window.location.href.includes(currentPage)
//               ? mapsFilledDanger
//               : mapsOutlinedDanger;
//           case "extra":
//             return window.location.href.includes(currentPage)
//               ? extraFilledDanger
//               : extraOutlinedDanger;
//           default:
//             return;
//         }
//       case "success":
//         switch (currentPage) {
//           case "dashboard":
//             return window.location.href.includes(currentPage)
//               ? darkDashboardIconSuccess
//               : lightDashboardIconSuccess;
//           case "ecommerce":
//             return window.location.href.includes(currentPage)
//               ? eCommerceFilledSuccess
//               : eCommerceOutlinedSuccess;
//           case "package":
//             return window.location.href.includes(currentPage)
//               ? packageFilledSuccess
//               : packageOutlinedSuccess;
//           case "profile":
//             return window.location.href.includes(currentPage)
//               ? profileFilledSuccess
//               : profileOutlinedSuccess;
//           case "settings":
//             return window.location.href.includes(currentPage)
//               ? settingsFilledSuccess
//               : settingsOutlinedSuccess;
//           case "logout":
//             return logoutIconSuccess;
//           case "email":
//             return window.location.href.includes(currentPage)
//               ? emailFilledSuccess
//               : emailOutlinedSuccess;
//           case "documentation":
//             return window.location.href.includes(currentPage)
//               ? documentationFilledSuccess
//               : documentationOutlinedSuccess;
//           case "core":
//             return window.location.href.includes(currentPage)
//               ? coreFilledSuccess
//               : coreOutlinedSuccess;
//           case "ui":
//             return window.location.href.includes(currentPage)
//               ? darkUISuccess
//               : lightUISuccess;
//           case "forms":
//             return window.location.href.includes(currentPage)
//               ? formsFilledSuccess
//               : formsOutlinedSuccess;
//           case "charts":
//             return window.location.href.includes(currentPage)
//               ? chartsFilledSuccess
//               : chartsOutlinedSuccess;
//           case "grid":
//             return window.location.href.includes(currentPage)
//               ? gridFilledSuccess
//               : gridOutlinedSuccess;
//           case "tables":
//             return window.location.href.includes(currentPage)
//               ? tablesFilledSuccess
//               : tablesOutlinedSuccess;
//           case "maps":
//             return window.location.href.includes(currentPage)
//               ? mapsFilledSuccess
//               : mapsOutlinedSuccess;
//           case "extra":
//             return window.location.href.includes(currentPage)
//               ? extraFilledSuccess
//               : extraOutlinedSuccess;
//           default:
//             return;
//         }
//       case "info":
//         switch (currentPage) {
//           case "dashboard":
//             return window.location.href.includes(currentPage)
//               ? darkDashboardIconBlue
//               : lightDashboardIconBlue;
//           case "ecommerce":
//             return window.location.href.includes(currentPage)
//               ? eCommerceFilledBlue
//               : eCommerceOutlinedBlue;
//           case "package":
//             return window.location.href.includes(currentPage)
//               ? packageFilledBlue
//               : packageOutlinedBlue;
//           case "profile":
//             return window.location.href.includes(currentPage)
//               ? profileFilledBlue
//               : profileOutlinedBlue;
//           case "settings":
//             return window.location.href.includes(currentPage)
//               ? settingsFilledBlue
//               : settingsOutlinedBlue;
//           case "logout":
//             return logoutIconBlue;
//           case "email":
//             return window.location.href.includes(currentPage)
//               ? emailFilledBlue
//               : emailOutlinedBlue;
//           case "documentation":
//             return window.location.href.includes(currentPage)
//               ? documentationFilledBlue
//               : documentationOutlinedBlue;
//           case "core":
//             return window.location.href.includes(currentPage)
//               ? coreFilledBlue
//               : coreOutlinedBlue;
//           case "ui":
//             return window.location.href.includes(currentPage)
//               ? darkUIBlue
//               : lightUIBlue;
//           case "forms":
//             return window.location.href.includes(currentPage)
//               ? formsFilledBlue
//               : formsOutlinedBlue;
//           case "charts":
//             return window.location.href.includes(currentPage)
//               ? chartsFilledBlue
//               : chartsOutlinedBlue;
//           case "grid":
//             return window.location.href.includes(currentPage)
//               ? gridFilledBlue
//               : gridOutlinedBlue;
//           case "tables":
//             return window.location.href.includes(currentPage)
//               ? tablesFilledBlue
//               : tablesOutlinedBlue;
//           case "maps":
//             return window.location.href.includes(currentPage)
//               ? mapsFilledBlue
//               : mapsOutlinedBlue;
//           case "extra":
//             return window.location.href.includes(currentPage)
//               ? extraFilledBlue
//               : extraOutlinedBlue;
//           default:
//             return;
//         }
//       default:
//         return;
//     }
//   }

//   getLogoImage() {
//     switch (this.props.themeColor) {
//       case "warning":
//         return AJIN_logo_white_background;
//       case "danger":
//         return AJIN_logo_white_background;
//       case "success":
//         return AJIN_logo_white_background;
//       case "info":
//         return AJIN_logo_white_background;
//       default:
//         return;
//     }
//   }

//   render() {
//     return (
//       <div
//         className={`${
//           !this.props.sidebarOpened && !this.props.sidebarStatic
//             ? s.sidebarClose
//             : ""
//         } ${s.sidebarWrapper} ${cx({
//           [`bg-transparent shadow-none`]:
//           this.props.sidebarType === "transparent",
//         })}`}
//         id={"sidebar-drawer"}
//       >
//         <nav
//           className={`${s.root} ${cx({
//             [`bg-transparent`]: this.props.sidebarType === "transparent",
//           })}`}
//         >
//           <header className={s.logo}>
//             <img src={this.getLogoImage()} alt="logo" className={s.logoStyle} />
//             {/* <span className={s.brand}>AJIN&nbsp;</span>
//             <span className={s.companyType}>INDS., LTD.</span> */}
//           </header>
//           <section className={s.menuWrapper}>
//             <ul className={s.nav}>
//               <LinksGroup
//                 onActiveSidebarItemChange={(activeItem) =>
//                   this.props.dispatch(changeActiveSidebarItem(activeItem))
//                 }
//                 activeItem={this.props.activeItem}
//                 header="Dashboard"
//                 isHeader
//                 link="/app/dashboard"
//                 index="dashboard"
//                 exact={false}
//                 childrenLinks={[
//                   {
//                     header: "Analytics",
//                     link: "/app/dashboard/analytics",
//                   },
//                   {
//                     header: "Visits",
//                     link: "/app/dashboard/visits",
//                   },
//                 ]}
//               >
//                 <img
//                   src={this.themeIcons("dashboard")}
//                   alt="lightDashboard"
//                   width={"24px"}
//                   height={"24px"}
//                 />
//               </LinksGroup>
//               <LinksGroup
//                 onActiveSidebarItemChange={(activeItem) =>
//                   this.props.dispatch(changeActiveSidebarItem(activeItem))
//                 }
//                 activeItem={this.props.activeItem}
//                 header="생산관리 시스템"
//                 isHeader
//                 link="/app/production/chart"
//                 index="production"
//                 exact={false}
//                 childrenLinks={[
//                   {
//                     header: "생산데이터 차트",
//                     link: "/app/production/chart",
//                   },
//                   {
//                     header: "생산 데이터 그리드",
//                     link: "/app/production/grid",
//                   }
//                 ]}
//               >
//                 <img
//                   src={this.themeIcons("ecommerce")}
//                   alt="lightDashboard"
//                   width={"24px"}
//                   height={"24px"}
//                 />
//               </LinksGroup>
//               <LinksGroup
//                 onActiveSidebarItemChange={(activeItem) =>
//                   this.props.dispatch(changeActiveSidebarItem(activeItem))
//                 }
//                 activeItem={this.props.activeItem}
//                 header="금형관리 시스템"
//                 isHeader
//                 link="/app/mold/chart"
//                 index="mold"
//                 childrenLinks={[
//                     {
//                       header: "금형데이터 차트",
//                       link: "/app/mold/chart",
//                     },
//                     {
//                       header: "금형세척 데이터",
//                       link: "/app/mold/data",
//                     },
//                     {
//                       header: "금형타수 데이터",
//                       link: "/app/mold/shotCountData"
//                     },
//                     {
//                       header: "금형고장 데이터",
//                       link: "/app/mold/moldBreakDown"
//                     }
//                   ]}
//               >
//                 <img
//                   src={this.themeIcons("package")}
//                   alt="lightDashboard"
//                   width={"24px"}
//                   height={"24px"}
//                 />
//               </LinksGroup>
//               <LinksGroup
//                   onActiveSidebarItemChange={(activeItem) =>
//                       this.props.dispatch(changeActiveSidebarItem(activeItem))
//                   }
//                   activeItem={this.props.activeItem}
//                   header="불량공정 시스템"
//                   isHeader
//                   link="/app/defect/chart"
//                   index="defect"
//                   exact={false}
//                   childrenLinks={[
//                     {
//                       header: "불량공정 차트",
//                       link: "/app/defect/chart",
//                     },
//                     {
//                       header: "불량공정 그리드",
//                       link: "/app/defect/grid",
//                     },
//                   ]}
//               >
//                 <img
//                     src={this.themeIcons("profile")}
//                     alt="lightDashboard"
//                     width={"24px"}
//                     height={"24px"}
//                 />
//               </LinksGroup>
//               <LinksGroup
//                 onActiveSidebarItemChange={(activeItem) =>
//                   this.props.dispatch(changeActiveSidebarItem(activeItem))
//                 }
//                 activeItem={this.props.activeItem}
//                 header="비가동 통계 시스템"
//                 isHeader
//                 link="/app/downtime/chart"
//                 index="downtime"
//                 childrenLinks={[
//                     {
//                       header: "비가동 통계 차트",
//                       link: "/app/downtime/chart",
//                     },
//                     {
//                       header: "비가동 통계 데이터",
//                       link: "/app/downtime/data",
//                     },
//                   ]}
//               >
//                 <img
//                   src={this.themeIcons("package")}
//                   alt="lightDashboard"
//                   width={"24px"}
//                   height={"24px"}
//                 />
//               </LinksGroup>
//               <LinksGroup
//                 onActiveSidebarItemChange={(activeItem) =>
//                   this.props.dispatch(changeActiveSidebarItem(activeItem))
//                 }
//                 activeItem={this.props.activeItem}
//                 header="초/중/종품 검사 시스템"
//                 isHeader
//                 link="/app/inspection/chart"
//                 index="inspection"
//                 childrenLinks={[
//                     {
//                       header: "검사 시스템 차트",
//                       link: "/app/inspection/chart",
//                     },
//                     {
//                       header: "검사 시스템 데이터",
//                       link: "/app/inspection/data",
//                     },
//                   ]}
//               >
//                 <img
//                   src={this.themeIcons("package")}
//                   alt="lightDashboard"
//                   width={"24px"}
//                   height={"24px"}
//                 />
//               </LinksGroup>
//                <LinksGroup
//                 onActiveSidebarItemChange={(activeItem) =>
//                   this.props.dispatch(changeActiveSidebarItem(activeItem))
//                 }
//                 activeItem={this.props.activeItem}
//                 header="관리자 시스템"
//                 isHeader
//                 link="/admin/users"
//                 index="admin"
//                 childrenLinks={[
//                     {
//                       header: "회사/공장/공정 데이터",
//                       link: "/admin/users",
//                     },
//                     {
//                       header: "공정코드 데이터",
//                       link: "/admin/users",
//                     },
//                     {
//                       header: "품목 데이터",
//                       link: "/admin/users",
//                     },
//                     {
//                       header: "사원 관리 데이터",
//                       link: "/app/admin/users",
//                     }
//                   ]}
//               >
//                 <img
//                   src={this.themeIcons("package")}
//                   alt="lightDashboard"
//                   width={"24px"}
//                   height={"24px"}
//                 />
//               </LinksGroup>
//               <LinksGroup
//                 onActiveSidebarItemChange={(activeItem) =>
//                   this.props.dispatch(changeActiveSidebarItem(activeItem))
//                 }
//                 activeItem={this.props.activeItem}
//                 header="Email"
//                 isHeader
//                 link="/app/email"
//                 index="email"
//                 badge={9}
//               >
//                 <img
//                   src={this.themeIcons("email")}
//                   alt="lightDashboard"
//                   width={"24px"}
//                   height={"24px"}
//                 />
//               </LinksGroup>
//               <LinksGroup
//                   onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
//                   activeItem={this.props.activeItem}
//                   header="Documentation"
//                   link="/documentation"
//                   isHeader
//                   index="documentation"
//                   target="_blank"
//               >
//                 <img
//                   src={this.themeIcons("documentation")}
//                   alt="lightDashboard"
//                   width={"24px"}
//                   height={"24px"}
//                 />
//               </LinksGroup>







//             </ul>
//             <ul className={s.downNav}>
//               <hr />
//               <LinksGroup
//                 onActiveSidebarItemChange={(activeItem) =>
//                   this.props.dispatch(changeActiveSidebarItem(activeItem))
//                 }
//                 header="Settings"
//                 isHeader
//                 index="main"
//               >
//                 <img
//                   src={this.themeIcons("settings")}
//                   alt="lightDashboard"
//                   width={"24px"}
//                   height={"24px"}
//                 />
//               </LinksGroup>
//               <LinksGroup
//                 onActiveSidebarItemChange={(activeItem) =>
//                   this.props.dispatch(changeActiveSidebarItem(activeItem))
//                 }
//                 header="Account"
//                 isHeader
//                 link={"/app/profile"}
//               >
//                 <img
//                   src={this.themeIcons("profile")}
//                   alt="lightDashboard"
//                   width={"24px"}
//                   height={"24px"}
//                 />
//               </LinksGroup>
//               <LinksGroup
//                 onActiveSidebarItemChange={(activeItem) =>
//                   this.props.dispatch(changeActiveSidebarItem(activeItem))
//                 }
//                 header="Logout"
//                 isHeader
//                 onClick={() => this.doLogout()}
//               >
//                 <img
//                   src={this.themeIcons("logout")}
//                   alt="lightDashboard"
//                   width={"24px"}
//                   height={"24px"}
//                 />
//               </LinksGroup>
//             </ul>
//           </section>
//         </nav>
//       </div>
//     );
//   }
// }

// function mapStateToProps(store) {
//   return {
//     sidebarOpened: store.navigation.sidebarOpened,
//     sidebarStatic: store.navigation.sidebarStatic,
//     alertsList: store.alerts.alertsList,
//     activeItem: store.navigation.activeItem,
//     navbarType: store.navigation.navbarType,
//     sidebarColor: store.layout.sidebarColor,
//     sidebarType: store.layout.sidebarType,
//     themeColor: store.layout.themeColor,
//   };
// }

// export default withRouter(connect(mapStateToProps)(Sidebar));


import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import cx from "classnames";
import s from "./Sidebar.module.scss";
import LinksGroup from "./LinksGroup/LinksGroup";
import { changeActiveSidebarItem, openSidebar, closeSidebar } from "../../actions/navigation";
import { logoutUser } from "../../actions/auth";

/* =========================
 * light / 기본 테마 세트 (warning)
 * ========================= */
import lightDashboardIcon from "../../images/theme-icons/yellow/Dashboard_outlined.svg";
import darkDashboardIcon from "../../images/theme-icons/yellow/Dashboard_filled.svg";
import lightUI from "../../images/ui-elements.svg";
import darkUI from "../../images/ui-elements-dark.svg";

import AJIN_logo_white_background from "../../images/AJIN_logo_white_background_gray.png"; // 글자 포함 로고
import logo from "../../images/AJIN_symbol_black.png"; // 심볼 로고

import settingsOutlined from "../../images/theme-icons/yellow/Settings_outlined.svg";
import settingsFilled from "../../images/theme-icons/yellow/Settings_outlined.svg";
import logoutIcon from "../../images/logout.svg";
import eCommerceOutlined from "../../images/theme-icons/yellow/E-commerce_outlined.svg";
import eCommerceFilled from "../../images/theme-icons/yellow/E-commerce_filled.svg";
import moldIconYellow from "../../images/theme-icons/yellow/Mold_icon_yellow.svg";
import packageOutlined from "../../images/theme-icons/yellow/Package_outlined.svg";
import packageFilled from "../../images/theme-icons/yellow/Package_filled.svg";
import profileOutlined from "../../images/theme-icons/yellow/Profile_outlined.svg";
import profileFilled from "../../images/theme-icons/yellow/Profile_filled.svg";
import emailOutlined from "../../images/theme-icons/yellow/Email_outlined.svg";
import emailFilled from "../../images/theme-icons/yellow/Email_filled.svg";
import documentationOutlined from "../../images/theme-icons/yellow/Documentation_outlined.svg";
import documentationFilled from "../../images/theme-icons/yellow/Documentation_filled.svg";
import coreOutlined from "../../images/theme-icons/yellow/Core_outlined.svg";
import coreFilled from "../../images/theme-icons/yellow/Core_filled.svg";
import formsOutlined from "../../images/theme-icons/yellow/Forms_outlined.svg";
import formsFilled from "../../images/theme-icons/yellow/Forms_filled.svg";
import chartsOutlined from "../../images/theme-icons/yellow/Charts_outlined.svg";
import chartsFilled from "../../images/theme-icons/yellow/Charts_filled.svg";
import gridOutlined from "../../images/theme-icons/yellow/Grid_outlined.svg";
import gridFilled from "../../images/theme-icons/yellow/Grid_filled.svg";
import tablesOutlined from "../../images/theme-icons/yellow/Tables_outlined.svg";
import tablesFilled from "../../images/theme-icons/yellow/Tables_filled.svg";
import mapsOutlined from "../../images/theme-icons/yellow/Maps_outlined.svg";
import mapsFilled from "../../images/theme-icons/yellow/Maps_filled.svg";
import extraOutlined from "../../images/light-extra.svg";
import extraFilled from "../../images/dark-extra.svg";

/* =======================
   아이콘 import (새로운 파일들)
   ======================= */

// Dashboard
import dashboardFilledYellow from "../../images/theme-icons/yellow/dashboard-svgrepo-com_yf.svg";
import dashboardOutlinedYellow from "../../images/theme-icons/yellow/dashboard-svgrepo-com_y.svg";

// 생산관리 시스템
import productionFilledYellow from "../../images/theme-icons/yellow/factory-svgrepo-com_y.svg";
import productionOutlinedYellow  from "../../images/theme-icons/yellow/factory-svgrepo-com_black.svg";

// 금형관리 시스템
import moldFilledYellow  from "../../images/theme-icons/yellow/tool-svgrepo-com_yf.svg";
import moldOutlinedYellow  from "../../images/theme-icons/yellow/tool-svgrepo-com_black.svg";

// 불량공정 시스템
import defectFilledYellow  from "../../images/theme-icons/yellow/alert-triangle-svgrepo-com_yf.svg";
import defectOutlinedYellow  from "../../images/theme-icons/yellow/alert-triangle-svgrepo-com_black.svg";

// 비가동 통계 시스템
import downtimeFilledYellow  from "../../images/theme-icons/yellow/clock-svgrepo-com_yf.svg";
import downtimeOutlinedYellow  from "../../images/theme-icons/yellow/clock-svgrepo-com_black.svg";

// 검사 시스템
import inspectionFilledYellow  from "../../images/theme-icons/yellow/check-lists-svgrepo-com_y.svg";
import inspectionOutlinedYellow  from "../../images/theme-icons/yellow/check-lists-svgrepo-com_black.svg";

// 관리자 시스템
import adminFilledYellow  from "../../images/theme-icons/yellow/user-svgrepo-com_yf.svg";
import adminOutlinedYellow  from "../../images/theme-icons/yellow/user-svgrepo-com_black.svg";


/* =========================
 * danger(빨강)
 * ========================= */
import lightDashboardIconDanger from "../../images/theme-icons/red/Dashboard_outlined.svg";
import darkDashboardIconDanger from "../../images/theme-icons/red/Dashboard_filled.svg";
import lightUIDanger from "../../images/theme-icons/red/ui elements_outlined.svg";
import darkUIDanger from "../../images/theme-icons/red/ui elements_filled.svg";
import settingsOutlinedDanger from "../../images/theme-icons/red/Settings_outlined.svg";
import settingsFilledDanger from "../../images/theme-icons/red/Settings_outlined.svg";
import logoutIconDanger from "../../images/theme-icons/red/Logout_outlined.svg";
import eCommerceOutlinedDanger from "../../images/theme-icons/red/E-commerce_outlined.svg";
import eCommerceFilledDanger from "../../images/theme-icons/red/E-commerce_filled.svg";
import packageOutlinedDanger from "../../images/theme-icons/red/Package_outlined.svg";
import packageFilledDanger from "../../images/theme-icons/red/Package_filled.svg";
import profileOutlinedDanger from "../../images/theme-icons/red/Profile_outlined.svg";
import profileFilledDanger from "../../images/theme-icons/red/Profile_filled.svg";
import emailOutlinedDanger from "../../images/theme-icons/red/Email_outlined.svg";
import emailFilledDanger from "../../images/theme-icons/red/Email_filled.svg";
import documentationOutlinedDanger from "../../images/theme-icons/red/Documentation_outlined.svg";
import documentationFilledDanger from "../../images/theme-icons/red/Documentation_filled.svg";
import coreOutlinedDanger from "../../images/theme-icons/red/Core_outlined.svg";
import coreFilledDanger from "../../images/theme-icons/red/Core_filled.svg";
import formsOutlinedDanger from "../../images/theme-icons/red/Forms_outlined.svg";
import formsFilledDanger from "../../images/theme-icons/red/Forms_filled.svg";
import chartsOutlinedDanger from "../../images/theme-icons/red/Charts_outlined.svg";
import chartsFilledDanger from "../../images/theme-icons/red/Charts_filled.svg";
import gridOutlinedDanger from "../../images/theme-icons/red/Grid_outlined.svg";
import gridFilledDanger from "../../images/theme-icons/red/Grid_filled.svg";
import tablesOutlinedDanger from "../../images/theme-icons/red/Tables_outlined.svg";
import tablesFilledDanger from "../../images/theme-icons/red/Tables_filled.svg";
import mapsOutlinedDanger from "../../images/theme-icons/red/Maps_outlined.svg";
import mapsFilledDanger from "../../images/theme-icons/red/Maps_filled.svg";
import extraOutlinedDanger from "../../images/theme-icons/red/Extra_outlined.svg";
import extraFilledDanger from "../../images/theme-icons/red/Extra_filled.svg";

/* =======================
   아이콘 import (새로운 파일들)
   ======================= */

// Dashboard
import dashboardFilledRed from "../../images/theme-icons/red/dashboard-svgrepo-com_rf.svg";
import dashboardOutlinedRed from "../../images/theme-icons/red/dashboard-svgrepo-com_r.svg";

// 생산관리 시스템
import productionFilledRed from "../../images/theme-icons/red/factory-svgrepo-com_r.svg";
import productionOutlinedRed from "../../images/theme-icons/yellow/factory-svgrepo-com_black.svg";

// 금형관리 시스템
import moldFilledRed from "../../images/theme-icons/red/tool-svgrepo-com_rf.svg";
import moldOutlinedRed from "../../images/theme-icons/yellow/tool-svgrepo-com_black.svg";

// 불량공정 시스템
import defectFilledRed from "../../images/theme-icons/red/alert-triangle-svgrepo-com_rf.svg";
import defectOutlinedRed from "../../images/theme-icons/yellow/alert-triangle-svgrepo-com_black.svg";

// 비가동 통계 시스템
import downtimeFilledRed from "../../images/theme-icons/red/clock-svgrepo-com_rf.svg";
import downtimeOutlinedRed from "../../images/theme-icons/yellow/clock-svgrepo-com_black.svg";

// 검사 시스템
import inspectionFilledRed from "../../images/theme-icons/red/check-lists-svgrepo-com_r.svg";
import inspectionOutlinedRed from "../../images/theme-icons/yellow/check-lists-svgrepo-com_black.svg";

// 관리자 시스템
import adminFilledRed from "../../images/theme-icons/red/user-svgrepo-com_rf.svg";
import adminOutlinedRed from "../../images/theme-icons/yellow/user-svgrepo-com_black.svg";

/* =========================
 * success(초록)
 * ========================= */
import lightDashboardIconSuccess from "../../images/theme-icons/green/Dashboard_outlined.svg";
import darkDashboardIconSuccess from "../../images/theme-icons/green/Dashboard_filled.svg";
import lightUISuccess from "../../images/theme-icons/green/ui elements_outlined.svg";
import darkUISuccess from "../../images/theme-icons/green/ui elements_filled.svg";
import settingsOutlinedSuccess from "../../images/theme-icons/green/Settings_outlined.svg";
import settingsFilledSuccess from "../../images/theme-icons/green/Settings_outlined.svg";
import logoutIconSuccess from "../../images/theme-icons/green/Logout_outlined.svg";
import eCommerceOutlinedSuccess from "../../images/theme-icons/green/E-commerce_outlined.svg";
import eCommerceFilledSuccess from "../../images/theme-icons/green/E-commerce_filled.svg";
import packageOutlinedSuccess from "../../images/theme-icons/green/Package_outlined.svg";
import packageFilledSuccess from "../../images/theme-icons/green/Package_filled.svg";
import profileOutlinedSuccess from "../../images/theme-icons/green/Profile_outlined.svg";
import profileFilledSuccess from "../../images/theme-icons/green/Profile_filled.svg";
import emailOutlinedSuccess from "../../images/theme-icons/green/Email_outlined.svg";
import emailFilledSuccess from "../../images/theme-icons/green/Email_filled.svg";
import documentationOutlinedSuccess from "../../images/theme-icons/green/Documentation_outlined.svg";
import documentationFilledSuccess from "../../images/theme-icons/green/Documentation_filled.svg";
import coreOutlinedSuccess from "../../images/theme-icons/green/Core_outlined.svg";
import coreFilledSuccess from "../../images/theme-icons/green/Core_filled.svg";
import formsOutlinedSuccess from "../../images/theme-icons/green/Forms_outlined.svg";
import formsFilledSuccess from "../../images/theme-icons/green/Forms_filled.svg";
import chartsOutlinedSuccess from "../../images/theme-icons/green/Charts_outlined.svg";
import chartsFilledSuccess from "../../images/theme-icons/green/Charts_filled.svg";
import gridOutlinedSuccess from "../../images/theme-icons/green/Grid_outlined.svg";
import gridFilledSuccess from "../../images/theme-icons/green/Grid_filled.svg";
import tablesOutlinedSuccess from "../../images/theme-icons/green/Tables_outlined.svg";
import tablesFilledSuccess from "../../images/theme-icons/green/Tables_filled.svg";
import mapsOutlinedSuccess from "../../images/theme-icons/green/Maps_outlined.svg";
import mapsFilledSuccess from "../../images/theme-icons/green/Maps_filled.svg";
import extraOutlinedSuccess from "../../images/theme-icons/green/Extra_outlined.svg";
import extraFilledSuccess from "../../images/theme-icons/green/Extra_filled.svg";

/* =======================
   아이콘 import (새로운 파일들)
   ======================= */

// Dashboard
import dashboardFilledGreen from "../../images/theme-icons/green/dashboard-svgrepo-com_gf.svg";
import dashboardOutlinedGreen from "../../images/theme-icons/green/dashboard-svgrepo-com_g.svg";

// 생산관리 시스템
import productionFilledGreen from "../../images/theme-icons/green/factory-svgrepo-com_g.svg";
import productionOutlinedGreen from "../../images/theme-icons/yellow/factory-svgrepo-com_black.svg";

// 금형관리 시스템
import moldFilledGreen from "../../images/theme-icons/green/tool-svgrepo-com_gf.svg";
import moldOutlinedGreen from "../../images/theme-icons/yellow/tool-svgrepo-com_black.svg";

// 불량공정 시스템
import defectFilledGreen from "../../images/theme-icons/green/alert-triangle-svgrepo-com_gf.svg";
import defectOutlinedGreen from "../../images/theme-icons/yellow/alert-triangle-svgrepo-com_black.svg";

// 비가동 통계 시스템
import downtimeFilledGreen from "../../images/theme-icons/green/clock-svgrepo-com_gf.svg";
import downtimeOutlinedGreen from "../../images/theme-icons/yellow/clock-svgrepo-com_black.svg";

// 검사 시스템
import inspectionFilledGreen from "../../images/theme-icons/green/check-lists-svgrepo-com_g.svg";
import inspectionOutlinedGreen from "../../images/theme-icons/yellow/check-lists-svgrepo-com_black.svg";

// 관리자 시스템
import adminFilledGreen from "../../images/theme-icons/green/user-svgrepo-com_gf.svg";
import adminOutlinedGreen from "../../images/theme-icons/yellow/user-svgrepo-com_black.svg";

/* =========================
 * info(파랑)
 * ========================= */
import lightDashboardIconBlue from "../../images/theme-icons/blue/Dashboard_outlined.svg";
import darkDashboardIconBlue from "../../images/theme-icons/blue/Dashboard_filled.svg";
import lightUIBlue from "../../images/theme-icons/blue/ui elements_outlined.svg";
import darkUIBlue from "../../images/theme-icons/blue/ui elements_filled.svg";
import settingsOutlinedBlue from "../../images/theme-icons/blue/Settings_outlined.svg";
import settingsFilledBlue from "../../images/theme-icons/blue/Settings_outlined.svg";
import logoutIconBlue from "../../images/theme-icons/blue/Logout_outlined.svg";
import eCommerceOutlinedBlue from "../../images/theme-icons/blue/E-commerce_outlined.svg";
import eCommerceFilledBlue from "../../images/theme-icons/blue/E-commerce_filled.svg";
import packageOutlinedBlue from "../../images/theme-icons/blue/Package_outlined.svg";
import packageFilledBlue from "../../images/theme-icons/blue/Package_filled.svg";
import profileOutlinedBlue from "../../images/theme-icons/blue/Profile_outlined.svg";
import profileFilledBlue from "../../images/theme-icons/blue/Profile_filled.svg";
import emailOutlinedBlue from "../../images/theme-icons/blue/Email_outlined.svg";
import emailFilledBlue from "../../images/theme-icons/blue/Email_filled.svg";
import documentationOutlinedBlue from "../../images/theme-icons/blue/Documentation_outlined.svg";
import documentationFilledBlue from "../../images/theme-icons/blue/Documentation_filled.svg";
import coreOutlinedBlue from "../../images/theme-icons/blue/Core_outlined.svg";
import coreFilledBlue from "../../images/theme-icons/blue/Core_filled.svg";
import formsOutlinedBlue from "../../images/theme-icons/blue/Forms_outlined.svg";
import formsFilledBlue from "../../images/theme-icons/blue/Forms_filled.svg";
import chartsOutlinedBlue from "../../images/theme-icons/blue/Charts_outlined.svg";
import chartsFilledBlue from "../../images/theme-icons/blue/Charts_filled.svg";
import gridOutlinedBlue from "../../images/theme-icons/blue/Grid_outlined.svg";
import gridFilledBlue from "../../images/theme-icons/blue/Grid_filled.svg";
import tablesOutlinedBlue from "../../images/theme-icons/blue/Tables_outlined.svg";
import tablesFilledBlue from "../../images/theme-icons/blue/Tables_filled.svg";
import mapsOutlinedBlue from "../../images/theme-icons/blue/Maps_outlined.svg";
import mapsFilledBlue from "../../images/theme-icons/blue/Maps_filled.svg";
import extraOutlinedBlue from "../../images/theme-icons/blue/Extra_outlined.svg";
import extraFilledBlue from "../../images/theme-icons/blue/Extra_filled.svg";

/* =======================
   아이콘 import (새로운 파일들)
   ======================= */

// Dashboard
import dashboardFilledBlue from "../../images/theme-icons/blue/dashboard-svgrepo-com_bf.svg";
import dashboardOutlinedBlue from "../../images/theme-icons/blue/dashboard-svgrepo-com_b.svg";

// 생산관리 시스템
import productionFilledBlue from "../../images/theme-icons/blue/factory-svgrepo-com_b.svg";
import productionOutlinedBlue from "../../images/theme-icons/yellow/factory-svgrepo-com_black.svg";

// 금형관리 시스템
import moldFilledBlue from "../../images/theme-icons/blue/tool-svgrepo-com_bf.svg";
import moldOutlinedBlue from "../../images/theme-icons/yellow/tool-svgrepo-com_black.svg";

// 불량공정 시스템
import defectFilledBlue from "../../images/theme-icons/blue/alert-triangle-svgrepo-com_bf.svg";
import defectOutlinedBlue from "../../images/theme-icons/yellow/alert-triangle-svgrepo-com_black.svg";

// 비가동 통계 시스템
import downtimeFilledBlue from "../../images/theme-icons/blue/clock-svgrepo-com_bf.svg";
import downtimeOutlinedBlue from "../../images/theme-icons/yellow/clock-svgrepo-com_black.svg";

// 검사 시스템
import inspectionFilledBlue from "../../images/theme-icons/blue/check-lists-svgrepo-com_b.svg";
import inspectionOutlinedBlue from "../../images/theme-icons/yellow/check-lists-svgrepo-com_black.svg";

// 관리자 시스템
import adminFilledBlue from "../../images/theme-icons/blue/user-svgrepo-com_bf.svg";
import adminOutlinedBlue from "../../images/theme-icons/yellow/user-svgrepo-com_black.svg";

/* =========================
 * dark sidebar 전용 아이콘 세트
 * ========================= */
// warning
import darkSidebarDashboardOutlined from "../../images/theme-icons/dark sidebar/yellow/Dashboard_outlined.svg";
import darkSidebarDashboardFilled from "../../images/theme-icons/dark sidebar/yellow/Dashboard_filled.svg";
import darkSidebarTablesOutlined from "../../images/theme-icons/dark sidebar/yellow/Tables_outlined.svg";
import darkSidebarTablesFilled from "../../images/theme-icons/dark sidebar/yellow/Tables_filled.svg";
import darkSidebarUIOutlined from "../../images/theme-icons/dark sidebar/yellow/ui elements_outlined.svg";
import darkSidebarUIFilled from "../../images/theme-icons/dark sidebar/yellow/ui elements_filled.svg";
import darkSidebarSettingsOutlined from "../../images/theme-icons/dark sidebar/yellow/Settings_outlined.svg";
import darkSidebarSettingsFilled from "../../images/theme-icons/dark sidebar/yellow/Settings_filled.svg";
import darkSidebarLogout from "../../images/theme-icons/dark sidebar/yellow/Logout_outlined.svg";
import darkSidebarAccountOutlined from "../../images/theme-icons/dark sidebar/yellow/Profile_outlined.svg";
import darkSidebarAccountFilled from "../../images/theme-icons/dark sidebar/yellow/Profile_filled.svg";
import darkSidebarEcommerceOutlined from "../../images/theme-icons/dark sidebar/yellow/E-commerce_outlined.svg";
import darkSidebarEcommerceFilled from "../../images/theme-icons/dark sidebar/yellow/E-commerce_filled.svg";
import darkSidebarPackageOutlined from "../../images/theme-icons/dark sidebar/yellow/Package_outlined.svg";
import darkSidebarPackageFilled from "../../images/theme-icons/dark sidebar/yellow/Package_filled.svg";
import darkSidebarEmailOutlined from "../../images/theme-icons/dark sidebar/yellow/Email_outlined.svg";
import darkSidebarEmailFilled from "../../images/theme-icons/dark sidebar/yellow/Email_filled.svg";
import darkSidebarDocumentationOutlined from "../../images/theme-icons/dark sidebar/yellow/Documentation_outlined.svg";
import darkSidebarDocumentationFilled from "../../images/theme-icons/dark sidebar/yellow/Documentation_filled.svg";
import darkSidebarCoreOutlined from "../../images/theme-icons/dark sidebar/yellow/Core_outlined.svg";
import darkSidebarCoreFilled from "../../images/theme-icons/dark sidebar/yellow/Core_filled.svg";
import darkSidebarFormsOutlined from "../../images/theme-icons/dark sidebar/yellow/Forms_outlined.svg";
import darkSidebarFormsFilled from "../../images/theme-icons/dark sidebar/yellow/Forms_filled.svg";
import darkSidebarChartsOutlined from "../../images/theme-icons/dark sidebar/yellow/Charts_outlined.svg";
import darkSidebarChartsFilled from "../../images/theme-icons/dark sidebar/yellow/Charts_filled.svg";
import darkSidebarGridOutlined from "../../images/theme-icons/dark sidebar/yellow/Grid_outlined.svg";
import darkSidebarGridFilled from "../../images/theme-icons/dark sidebar/yellow/Grid_filled.svg";
import darkSidebarMapsOutlined from "../../images/theme-icons/dark sidebar/yellow/Maps_outlined.svg";
import darkSidebarMapsFilled from "../../images/theme-icons/dark sidebar/yellow/Maps_filled.svg";
import darkSidebarExtraOutlined from "../../images/theme-icons/dark sidebar/yellow/Extra_outlined.svg";
import darkSidebarExtraFilled from "../../images/theme-icons/dark sidebar/yellow/Extra_filled.svg";

// danger
import darkSidebarDashboardOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Dashboard_outlined.svg";
import darkSidebarDashboardFilledDanger from "../../images/theme-icons/dark sidebar/red/Dashboard_filled.svg";
import darkSidebarTablesOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Tables_outlined.svg";
import darkSidebarTablesFilledDanger from "../../images/theme-icons/dark sidebar/red/Tables_filled.svg";
import darkSidebarUIOutlinedDanger from "../../images/theme-icons/dark sidebar/red/ui elements_outlined.svg";
import darkSidebarUIFilledDanger from "../../images/theme-icons/dark sidebar/red/ui elements_filled.svg";
import darkSidebarSettingsOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Settings_outlined.svg";
import darkSidebarSettingsFilledDanger from "../../images/theme-icons/dark sidebar/red/Settings_filled.svg";
import darkSidebarLogoutDanger from "../../images/theme-icons/dark sidebar/red/Logout_outlined.svg";
import darkSidebarAccountOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Profile_outlined.svg";
import darkSidebarAccountFilledDanger from "../../images/theme-icons/dark sidebar/red/Profile_filled.svg";
import darkSidebarEcommerceOutlinedDanger from "../../images/theme-icons/dark sidebar/red/E-commerce_outlined.svg";
import darkSidebarEcommerceFilledDanger from "../../images/theme-icons/dark sidebar/red/E-commerce_filled.svg";
import darkSidebarPackageOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Package_outlined.svg";
import darkSidebarPackageFilledDanger from "../../images/theme-icons/dark sidebar/red/Package_filled.svg";
import darkSidebarEmailOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Email_outlined.svg";
import darkSidebarEmailFilledDanger from "../../images/theme-icons/dark sidebar/red/Email_filled.svg";
import darkSidebarDocumentationOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Documentation_outlined.svg";
import darkSidebarDocumentationFilledDanger from "../../images/theme-icons/dark sidebar/red/Documentation_filled.svg";
import darkSidebarCoreOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Core_outlined.svg";
import darkSidebarCoreFilledDanger from "../../images/theme-icons/dark sidebar/red/Core_filled.svg";
import darkSidebarFormsOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Forms_outlined.svg";
import darkSidebarFormsFilledDanger from "../../images/theme-icons/dark sidebar/red/Forms_filled.svg";
import darkSidebarChartsOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Charts_outlined.svg";
import darkSidebarChartsFilledDanger from "../../images/theme-icons/dark sidebar/red/Charts_filled.svg";
import darkSidebarGridOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Grid_outlined.svg";
import darkSidebarGridFilledDanger from "../../images/theme-icons/dark sidebar/red/Grid_filled.svg";
import darkSidebarMapsOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Maps_outlined.svg";
import darkSidebarMapsFilledDanger from "../../images/theme-icons/dark sidebar/red/Maps_filled.svg";
import darkSidebarExtraOutlinedDanger from "../../images/theme-icons/dark sidebar/red/Extra_outlined.svg";
import darkSidebarExtraFilledDanger from "../../images/theme-icons/dark sidebar/red/Extra_filled.svg";

// success
import darkSidebarDashboardOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Dashboard_outlined.svg";
import darkSidebarDashboardFilledSuccess from "../../images/theme-icons/dark sidebar/green/Dashboard_filled.svg";
import darkSidebarTablesOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Tables_outlined.svg";
import darkSidebarTablesFilledSuccess from "../../images/theme-icons/dark sidebar/green/Tables_filled.svg";
import darkSidebarUIOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/ui elements_outlined.svg";
import darkSidebarUIFilledSuccess from "../../images/theme-icons/dark sidebar/green/ui elements_filled.svg";
import darkSidebarSettingsOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Settings_outlined.svg";
import darkSidebarSettingsFilledSuccess from "../../images/theme-icons/dark sidebar/green/Settings_filled.svg";
import darkSidebarLogoutSuccess from "../../images/theme-icons/dark sidebar/green/Logout_outlined.svg";
import darkSidebarAccountOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Profile_outlined.svg";
import darkSidebarAccountFilledSuccess from "../../images/theme-icons/dark sidebar/green/Profile_filled.svg";
import darkSidebarEcommerceOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/E-commerce_outlined.svg";
import darkSidebarEcommerceFilledSuccess from "../../images/theme-icons/dark sidebar/green/E-commerce_filled.svg";
import darkSidebarPackageOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Package_outlined.svg";
import darkSidebarPackageFilledSuccess from "../../images/theme-icons/dark sidebar/green/Package_filled.svg";
import darkSidebarEmailOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Email_outlined.svg";
import darkSidebarEmailFilledSuccess from "../../images/theme-icons/dark sidebar/green/Email_filled.svg";
import darkSidebarDocumentationOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Documentation_outlined.svg";
import darkSidebarDocumentationFilledSuccess from "../../images/theme-icons/dark sidebar/green/Documentation_filled.svg";
import darkSidebarCoreOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Core_outlined.svg";
import darkSidebarCoreFilledSuccess from "../../images/theme-icons/dark sidebar/green/Core_filled.svg";
import darkSidebarFormsOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Forms_outlined.svg";
import darkSidebarFormsFilledSuccess from "../../images/theme-icons/dark sidebar/green/Forms_filled.svg";
import darkSidebarChartsOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Charts_outlined.svg";
import darkSidebarChartsFilledSuccess from "../../images/theme-icons/dark sidebar/green/Charts_filled.svg";
import darkSidebarGridOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Grid_outlined.svg";
import darkSidebarGridFilledSuccess from "../../images/theme-icons/dark sidebar/green/Grid_filled.svg";
import darkSidebarMapsOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Maps_outlined.svg";
import darkSidebarMapsFilledSuccess from "../../images/theme-icons/dark sidebar/green/Maps_filled.svg";
import darkSidebarExtraOutlinedSuccess from "../../images/theme-icons/dark sidebar/green/Extra_outlined.svg";
import darkSidebarExtraFilledSuccess from "../../images/theme-icons/dark sidebar/green/Extra_filled.svg";

// info
import darkSidebarDashboardOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Dashboard_outlined.svg";
import darkSidebarDashboardFilledBlue from "../../images/theme-icons/dark sidebar/blue/Dashboard_filled.svg";
import darkSidebarTablesOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Tables_outlined.svg";
import darkSidebarTablesFilledBlue from "../../images/theme-icons/dark sidebar/blue/Tables_filled.svg";
import darkSidebarUIOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/ui elements_outlined.svg";
import darkSidebarUIFilledBlue from "../../images/theme-icons/dark sidebar/blue/ui elements_filled.svg";
import darkSidebarSettingsOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Settings_outlined.svg";
import darkSidebarSettingsFilledBlue from "../../images/theme-icons/dark sidebar/blue/Settings_filled.svg";
import darkSidebarLogoutBlue from "../../images/theme-icons/dark sidebar/blue/Logout_outlined.svg";
import darkSidebarAccountOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Profile_outlined.svg";
import darkSidebarAccountFilledBlue from "../../images/theme-icons/dark sidebar/blue/Profile_filled.svg";
import darkSidebarEcommerceOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/E-commerce_outlined.svg";
import darkSidebarEcommerceFilledBlue from "../../images/theme-icons/dark sidebar/blue/E-commerce_filled.svg";
import darkSidebarPackageOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Package_outlined.svg";
import darkSidebarPackageFilledBlue from "../../images/theme-icons/dark sidebar/blue/Package_filled.svg";
import darkSidebarEmailOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Email_outlined.svg";
import darkSidebarEmailFilledBlue from "../../images/theme-icons/dark sidebar/blue/Email_filled.svg";
import darkSidebarDocumentationOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Documentation_outlined.svg";
import darkSidebarDocumentationFilledBlue from "../../images/theme-icons/dark sidebar/blue/Documentation_filled.svg";
import darkSidebarCoreOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Core_outlined.svg";
import darkSidebarCoreFilledBlue from "../../images/theme-icons/dark sidebar/blue/Core_filled.svg";
import darkSidebarFormsOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Forms_outlined.svg";
import darkSidebarFormsFilledBlue from "../../images/theme-icons/dark sidebar/blue/Forms_filled.svg";
import darkSidebarChartsOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Charts_outlined.svg";
import darkSidebarChartsFilledBlue from "../../images/theme-icons/dark sidebar/blue/Charts_filled.svg";
import darkSidebarGridOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Grid_outlined.svg";
import darkSidebarGridFilledBlue from "../../images/theme-icons/dark sidebar/blue/Grid_filled.svg";
import darkSidebarMapsOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Maps_outlined.svg";
import darkSidebarMapsFilledBlue from "../../images/theme-icons/dark sidebar/blue/Maps_filled.svg";
import darkSidebarExtraOutlinedBlue from "../../images/theme-icons/dark sidebar/blue/Extra_outlined.svg";
import darkSidebarExtraFilledBlue from "../../images/theme-icons/dark sidebar/blue/Extra_filled.svg";

/* =======================
    사이드바 아이콘 모음.zip
   ======================= */
// Dashboard Icon
import Dashboard_icon_yellow from "../../images/theme-icons/yellow/Dashboard_icon_yellow.svg"
import Dashboard_icon_red from "../../images/theme-icons/red/Dashboard_icon_red.svg"
import Dashboard_icon_green from "../../images/theme-icons/green/Dashboard_icon_green.svg"
import Dashboard_icon_blue from "../../images/theme-icons/blue/Dashboard_icon_blue.svg"

// 생산관리(Production) Icon
import Production_icon_yellow from "../../images/theme-icons/yellow/Production_icon_yellow.svg"
import Production_icon_red from "../../images/theme-icons/red/Production_icon_red.svg"
import Production_icon_green from "../../images/theme-icons/green/Production_icon_green.svg"
import Production_icon_blue from "../../images/theme-icons/blue/Production_icon_blue.svg"

// 금형관리(Mold) Icon
import Mold_icon_yellow from "../../images/theme-icons/yellow/Mold_icon_yellow.svg"
import Mold_icon_red from "../../images/theme-icons/red/Mold_icon_red.svg"
import Mold_icon_green from "../../images/theme-icons/green/Mold_icon_green.svg"
import Mold_icon_blue from "../../images/theme-icons/blue/Mold_icon_blue.svg"

// 불량공정(Defect) Icon
import Defect_icon_yellow from "../../images/theme-icons/yellow/Defect_icon_yellow.svg"
import Defect_icon_red from "../../images/theme-icons/red/Defect_icon_red.svg"
import Defect_icon_green from "../../images/theme-icons/green/Defect_icon_green.svg"
import Defect_icon_blue from "../../images/theme-icons/blue/Defect_icon_blue.svg"

// 비가동통계(Downtime) Icon
import Downtime_icon_yellow from "../../images/theme-icons/yellow/Downtime_icon_yellow.svg"
import Downtime_icon_red from "../../images/theme-icons/red/Downtime_icon_red.svg"
import Downtime_icon_green from "../../images/theme-icons/green/Downtime_icon_green.svg"
import Downtime_icon_blue from "../../images/theme-icons/blue/Downtime_icon_blue.svg"

// 검사시스템(Inspection) Icon
import Inspection_icon_yellow from "../../images/theme-icons/yellow/Inspection_icon_yellow.svg"
import Inspection_icon_red from "../../images/theme-icons/red/Inspection_icon_red.svg"
import Inspection_icon_green from "../../images/theme-icons/green/Inspection_icon_green.svg"
import Inspection_icon_blue from "../../images/theme-icons/blue/Inspection_icon_blue.svg"

// 사원관리(Account) Icon
import Account_icon_yellow from "../../images/theme-icons/yellow/Account_icon_yellow.svg"
import Account_icon_red from "../../images/theme-icons/red/Account_icon_red.svg"
import Account_icon_green from "../../images/theme-icons/green/Account_icon_green.svg"
import Account_icon_blue from "../../images/theme-icons/blue/Account_icon_blue.svg"


class Sidebar extends React.Component {
  static propTypes = {
    sidebarStatic: PropTypes.bool,
    sidebarOpened: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    activeItem: PropTypes.string,
    location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
    sidebarColor: PropTypes.string,
    sidebarType: PropTypes.string,
    themeColor: PropTypes.string,
  };

  static defaultProps = {
    sidebarStatic: true,
    sidebarOpened: true,
    activeItem: "",
  };

  constructor(props) {
    super(props);
    this.doLogout = this.doLogout.bind(this);
    this.themeIcons = this.themeIcons.bind(this);
    this.handleLogoClick = this.handleLogoClick.bind(this);
    this.handleLogoKeyDown = this.handleLogoKeyDown.bind(this);
  }

  doLogout() {
    this.props.dispatch(logoutUser());
  }

  handleLogoClick() {
    if (this.props.sidebarOpened) this.props.dispatch(closeSidebar());
    else this.props.dispatch(openSidebar());
  }
  handleLogoKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.handleLogoClick();
    }
  }

  /* =========================
   * 테마별 아이콘 선택
   * ========================= */
  themeIcons(currentPage) {
    const ACTIVE = window.location.href.includes(currentPage);

    // dark 사이드바 전용 맵
    const darkSets = {
      warning: {
        dashboard: { filled: darkSidebarDashboardFilled, outlined: darkSidebarDashboardOutlined },
        ecommerce: { filled: darkSidebarEcommerceFilled, outlined: darkSidebarEcommerceOutlined },
        package: { filled: darkSidebarPackageFilled, outlined: darkSidebarPackageOutlined },
        profile: { filled: darkSidebarAccountFilled, outlined: darkSidebarAccountOutlined },
        settings: { filled: darkSidebarSettingsFilled, outlined: darkSidebarSettingsOutlined },
        logout: { filled: darkSidebarLogout, outlined: darkSidebarLogout },
        email: { filled: darkSidebarEmailFilled, outlined: darkSidebarEmailOutlined },
        documentation: { filled: darkSidebarDocumentationFilled, outlined: darkSidebarDocumentationOutlined },
        core: { filled: darkSidebarCoreFilled, outlined: darkSidebarCoreOutlined },
        ui: { filled: darkSidebarUIFilled, outlined: darkSidebarUIOutlined },
        forms: { filled: darkSidebarFormsFilled, outlined: darkSidebarFormsOutlined },
        charts: { filled: darkSidebarChartsFilled, outlined: darkSidebarChartsOutlined },
        grid: { filled: darkSidebarGridFilled, outlined: darkSidebarGridOutlined },
        tables: { filled: darkSidebarTablesFilled, outlined: darkSidebarTablesOutlined },
        maps: { filled: darkSidebarMapsFilled, outlined: darkSidebarMapsOutlined },
        extra: { filled: darkSidebarExtraFilled, outlined: darkSidebarExtraOutlined },
      },
      danger: {
        dashboard: { filled: darkSidebarDashboardFilledDanger, outlined: darkSidebarDashboardOutlinedDanger },
        ecommerce: { filled: darkSidebarEcommerceFilledDanger, outlined: darkSidebarEcommerceOutlinedDanger },
        package: { filled: darkSidebarPackageFilledDanger, outlined: darkSidebarPackageOutlinedDanger },
        profile: { filled: darkSidebarAccountFilledDanger, outlined: darkSidebarAccountOutlinedDanger },
        settings: { filled: darkSidebarSettingsFilledDanger, outlined: darkSidebarSettingsOutlinedDanger },
        logout: { filled: darkSidebarLogoutDanger, outlined: darkSidebarLogoutDanger },
        email: { filled: darkSidebarEmailFilledDanger, outlined: darkSidebarEmailOutlinedDanger },
        documentation: { filled: darkSidebarDocumentationFilledDanger, outlined: darkSidebarDocumentationOutlinedDanger },
        core: { filled: darkSidebarCoreFilledDanger, outlined: darkSidebarCoreOutlinedDanger },
        ui: { filled: darkSidebarUIFilledDanger, outlined: darkSidebarUIOutlinedDanger },
        forms: { filled: darkSidebarFormsFilledDanger, outlined: darkSidebarFormsOutlinedDanger },
        charts: { filled: darkSidebarChartsFilledDanger, outlined: darkSidebarChartsOutlinedDanger },
        grid: { filled: darkSidebarGridFilledDanger, outlined: darkSidebarGridOutlinedDanger },
        tables: { filled: darkSidebarTablesFilledDanger, outlined: darkSidebarTablesOutlinedDanger },
        maps: { filled: darkSidebarMapsFilledDanger, outlined: darkSidebarMapsOutlinedDanger },
        extra: { filled: darkSidebarExtraFilledDanger, outlined: darkSidebarExtraOutlinedDanger },
      },
      success: {
        dashboard: { filled: darkSidebarDashboardFilledSuccess, outlined: darkSidebarDashboardOutlinedSuccess },
        ecommerce: { filled: darkSidebarEcommerceFilledSuccess, outlined: darkSidebarEcommerceOutlinedSuccess },
        package: { filled: darkSidebarPackageFilledSuccess, outlined: darkSidebarPackageOutlinedSuccess },
        profile: { filled: darkSidebarAccountFilledSuccess, outlined: darkSidebarAccountOutlinedSuccess },
        settings: { filled: darkSidebarSettingsFilledSuccess, outlined: darkSidebarSettingsOutlinedSuccess },
        logout: { filled: darkSidebarLogoutSuccess, outlined: darkSidebarLogoutSuccess },
        email: { filled: darkSidebarEmailFilledSuccess, outlined: darkSidebarEmailOutlinedSuccess },
        documentation: { filled: darkSidebarDocumentationFilledSuccess, outlined: darkSidebarDocumentationOutlinedSuccess },
        core: { filled: darkSidebarCoreFilledSuccess, outlined: darkSidebarCoreOutlinedSuccess },
        ui: { filled: darkSidebarUIFilledSuccess, outlined: darkSidebarUIOutlinedSuccess },
        forms: { filled: darkSidebarFormsFilledSuccess, outlined: darkSidebarFormsOutlinedSuccess },
        charts: { filled: darkSidebarChartsFilledSuccess, outlined: darkSidebarChartsOutlinedSuccess },
        grid: { filled: darkSidebarGridFilledSuccess, outlined: darkSidebarGridOutlinedSuccess },
        tables: { filled: darkSidebarTablesFilledSuccess, outlined: darkSidebarTablesOutlinedSuccess },
        maps: { filled: darkSidebarMapsFilledSuccess, outlined: darkSidebarMapsOutlinedSuccess },
        extra: { filled: darkSidebarExtraFilledSuccess, outlined: darkSidebarExtraOutlinedSuccess },
      },
      info: {
        dashboard: { filled: darkSidebarDashboardFilledBlue, outlined: darkSidebarDashboardOutlinedBlue },
        ecommerce: { filled: darkSidebarEcommerceFilledBlue, outlined: darkSidebarEcommerceOutlinedBlue },
        package: { filled: darkSidebarPackageFilledBlue, outlined: darkSidebarPackageOutlinedBlue },
        profile: { filled: darkSidebarAccountFilledBlue, outlined: darkSidebarAccountOutlinedBlue },
        settings: { filled: darkSidebarSettingsFilledBlue, outlined: darkSidebarSettingsOutlinedBlue },
        logout: { filled: darkSidebarLogoutBlue, outlined: darkSidebarLogoutBlue },
        email: { filled: darkSidebarEmailFilledBlue, outlined: darkSidebarEmailOutlinedBlue },
        documentation: { filled: darkSidebarDocumentationFilledBlue, outlined: darkSidebarDocumentationOutlinedBlue },
        core: { filled: darkSidebarCoreFilledBlue, outlined: darkSidebarCoreOutlinedBlue },
        ui: { filled: darkSidebarUIFilledBlue, outlined: darkSidebarUIOutlinedBlue },
        forms: { filled: darkSidebarFormsFilledBlue, outlined: darkSidebarFormsOutlinedBlue },
        charts: { filled: darkSidebarChartsFilledBlue, outlined: darkSidebarChartsOutlinedBlue },
        grid: { filled: darkSidebarGridFilledBlue, outlined: darkSidebarGridOutlinedBlue },
        tables: { filled: darkSidebarTablesFilledBlue, outlined: darkSidebarTablesOutlinedBlue },
        maps: { filled: darkSidebarMapsFilledBlue, outlined: darkSidebarMapsOutlinedBlue },
        extra: { filled: darkSidebarExtraFilledBlue, outlined: darkSidebarExtraOutlinedBlue },
      },
    };

    // light(기본) 사이드바 맵
    const lightSets = {
      warning: {
        // dashboard: { filled: darkDashboardIcon, outlined: lightDashboardIcon },
        // ecommerce: { filled: eCommerceFilled, outlined: eCommerceOutlined },
        // // package: { filled: packageFilled, outlined: moldIconYellow },
        // profile: { filled: profileFilled, outlined: profileOutlined },
        dashboard: { filled: dashboardFilledYellow, outlined: dashboardOutlinedYellow },
        production: { filled: productionFilledYellow, outlined: productionOutlinedYellow },
        mold: { filled: moldFilledYellow, outlined: moldOutlinedYellow },
        defect: { filled: defectFilledYellow, outlined: defectOutlinedYellow },
        downtime: { filled: downtimeFilledYellow, outlined: downtimeOutlinedYellow },
        inspection: { filled: inspectionFilledYellow, outlined: inspectionOutlinedYellow },
        admin: { filled: adminFilledYellow, outlined: adminOutlinedYellow },

        settings: { filled: settingsFilled, outlined: settingsOutlined },
        logout: { filled: logoutIcon, outlined: logoutIcon },
        email: { filled: emailFilled, outlined: emailOutlined },
        documentation: { filled: documentationFilled, outlined: documentationOutlined },
        core: { filled: coreFilled, outlined: coreOutlined },
        ui: { filled: darkUI, outlined: lightUI },
        forms: { filled: formsFilled, outlined: formsOutlined },
        charts: { filled: chartsFilled, outlined: chartsOutlined },
        grid: { filled: gridFilled, outlined: gridOutlined },
        tables: { filled: tablesFilled, outlined: tablesOutlined },
        maps: { filled: mapsFilled, outlined: mapsOutlined },
        extra: { filled: extraFilled, outlined: extraOutlined },
      },
      danger: {
        // dashboard: { filled: darkDashboardIconDanger, outlined: lightDashboardIconDanger },
        // ecommerce: { filled: eCommerceFilledDanger, outlined: eCommerceOutlinedDanger },
        // package: { filled: packageFilledDanger, outlined: packageOutlinedDanger },
        // profile: { filled: profileFilledDanger, outlined: profileOutlinedDanger },
        dashboard: { filled: dashboardFilledRed, outlined: dashboardOutlinedRed },
        production: { filled: productionFilledRed, outlined: productionOutlinedRed },
        mold: { filled: moldFilledRed, outlined: moldOutlinedRed },
        defect: { filled: defectFilledRed, outlined: defectOutlinedRed },
        downtime: { filled: downtimeFilledRed, outlined: downtimeOutlinedRed },
        inspection: { filled: inspectionFilledRed, outlined: inspectionOutlinedRed },
        admin: { filled: adminFilledRed, outlined: adminOutlinedRed },

        settings: { filled: settingsFilledDanger, outlined: settingsOutlinedDanger },
        logout: { filled: logoutIconDanger, outlined: logoutIconDanger },
        email: { filled: emailFilledDanger, outlined: emailOutlinedDanger },
        documentation: { filled: documentationFilledDanger, outlined: documentationOutlinedDanger },
        core: { filled: coreFilledDanger, outlined: coreOutlinedDanger },
        ui: { filled: darkUIDanger, outlined: lightUIDanger },
        forms: { filled: formsFilledDanger, outlined: formsOutlinedDanger },
        charts: { filled: chartsFilledDanger, outlined: chartsOutlinedDanger },
        grid: { filled: gridFilledDanger, outlined: gridOutlinedDanger },
        tables: { filled: tablesFilledDanger, outlined: tablesOutlinedDanger },
        maps: { filled: mapsFilledDanger, outlined: mapsOutlinedDanger },
        extra: { filled: extraFilledDanger, outlined: extraOutlinedDanger },
      },
      success: {
        // dashboard: { filled: darkDashboardIconSuccess, outlined: lightDashboardIconSuccess },
        // ecommerce: { filled: eCommerceFilledSuccess, outlined: eCommerceOutlinedSuccess },
        // package: { filled: packageFilledSuccess, outlined: packageOutlinedSuccess },
        // profile: { filled: profileFilledSuccess, outlined: profileOutlinedSuccess },
        dashboard: { filled: dashboardFilledGreen, outlined: dashboardOutlinedGreen },
        production: { filled: productionFilledGreen, outlined: productionOutlinedGreen },
        mold: { filled: moldFilledGreen, outlined: moldOutlinedGreen },
        defect: { filled: defectFilledGreen, outlined: defectOutlinedGreen },
        downtime: { filled: downtimeFilledGreen, outlined: downtimeOutlinedGreen },
        inspection: { filled: inspectionFilledGreen, outlined: inspectionOutlinedGreen },
        admin: { filled: adminFilledGreen, outlined: adminOutlinedGreen },

        settings: { filled: settingsFilledSuccess, outlined: settingsOutlinedSuccess },
        logout: { filled: logoutIconSuccess, outlined: logoutIconSuccess },
        email: { filled: emailFilledSuccess, outlined: emailOutlinedSuccess },
        documentation: { filled: documentationFilledSuccess, outlined: documentationOutlinedSuccess },
        core: { filled: coreFilledSuccess, outlined: coreOutlinedSuccess },
        ui: { filled: darkUISuccess, outlined: lightUISuccess },
        forms: { filled: formsFilledSuccess, outlined: formsOutlinedSuccess },
        charts: { filled: chartsFilledSuccess, outlined: chartsOutlinedSuccess },
        grid: { filled: gridFilledSuccess, outlined: gridOutlinedSuccess },
        tables: { filled: tablesFilledSuccess, outlined: tablesOutlinedSuccess },
        maps: { filled: mapsFilledSuccess, outlined: mapsOutlinedSuccess },
        extra: { filled: extraFilledSuccess, outlined: extraOutlinedSuccess },
      },
      info: {
        // dashboard: { filled: darkDashboardIconBlue, outlined: lightDashboardIconBlue },
        // ecommerce: { filled: eCommerceFilledBlue, outlined: eCommerceOutlinedBlue },
        // package: { filled: packageFilledBlue, outlined: packageOutlinedBlue },
        // profile: { filled: profileFilledBlue, outlined: profileOutlinedBlue },
        dashboard: { filled: dashboardFilledBlue, outlined: dashboardOutlinedBlue },
        production: { filled: productionFilledBlue, outlined: productionOutlinedBlue },
        mold: { filled: moldFilledBlue, outlined: moldOutlinedBlue },
        defect: { filled: defectFilledBlue, outlined: defectOutlinedBlue },
        downtime: { filled: downtimeFilledBlue, outlined: downtimeOutlinedBlue },
        inspection: { filled: inspectionFilledBlue, outlined: inspectionOutlinedBlue },
        admin: { filled: adminFilledBlue, outlined: adminOutlinedBlue },

        settings: { filled: settingsFilledBlue, outlined: settingsOutlinedBlue },
        logout: { filled: logoutIconBlue, outlined: logoutIconBlue },
        email: { filled: emailFilledBlue, outlined: emailOutlinedBlue },
        documentation: { filled: documentationFilledBlue, outlined: documentationOutlinedBlue },
        core: { filled: coreFilledBlue, outlined: coreOutlinedBlue },
        ui: { filled: darkUIBlue, outlined: lightUIBlue },
        forms: { filled: formsFilledBlue, outlined: formsOutlinedBlue },
        charts: { filled: chartsFilledBlue, outlined: chartsOutlinedBlue },
        grid: { filled: gridFilledBlue, outlined: gridOutlinedBlue },
        tables: { filled: tablesFilledBlue, outlined: tablesOutlinedBlue },
        maps: { filled: mapsFilledBlue, outlined: mapsOutlinedBlue },
        extra: { filled: extraFilledBlue, outlined: extraOutlinedBlue },
      },
    };

    const theme = this.props.themeColor || "warning";
    const set = this.props.sidebarColor === "dark" ? darkSets[theme] : lightSets[theme];
    const pair = set[currentPage];
    if (!pair) return null;
    return ACTIVE ? pair.filled : pair.outlined;
  }

  renderIconOnlyNav() {
    // 아이콘 전용 항목(접힘일 때만 사용)
    const items = [
      { key: "dashboard", label: "Dashboard", link: "/app/dashboard", iconKey: "dashboard" },
      { key: "production", label: "생산관리 시스템", link: "/app/production/chart", iconKey: "production" },
      { key: "mold", label: "금형관리 시스템", link: "/app/mold/chart", iconKey: "mold" },
      { key: "defect", label: "불량공정 시스템", link: "/app/defect/chart", iconKey: "defect" },
      { key: "downtime", label: "비가동 통계 시스템", link: "/app/downtime/chart", iconKey: "downtime" },
      { key: "inspection", label: "초/중/종품 검사 시스템", link: "/app/inspection/chart", iconKey: "inspection" },
      { key: "admin", label: "관리자 시스템", link: "/admin/users", iconKey: "admin" },
      { key: "email", label: "Email", link: "/app/email", iconKey: "email", badge: 9 },
      { key: "documentation", label: "Documentation", link: "/documentation", iconKey: "documentation", target: "_blank" },
    ];

    const bottomItems = [
      { key: "settings", label: "Settings", link: "#", iconKey: "settings" },
      { key: "account", label: "Account", link: "/app/profile", iconKey: "profile" },
      { key: "logout", label: "Logout", onClick: this.doLogout, iconKey: "logout" },
    ];

    return (
      <>
        <ul className={s.iconNav} aria-label="Main navigation (icons only)">
          {items.map((it) => {
            const icon = this.themeIcons(it.iconKey);
            const content = (
              <>
                <img src={icon} alt={it.label} width="24" height="24" />
                {it.badge ? <span className={s.iconBadge}>{it.badge}</span> : null}
              </>
            );
            return (
              <li key={it.key} className={s.iconItem}>
                {it.onClick ? (
                  <button type="button" className={s.iconBtn} onClick={it.onClick} title={it.label} aria-label={it.label}>
                    {content}
                  </button>
                ) : it.target === "_blank" ? (
                  <a href={`#${it.link}`} className={s.iconBtn} title={it.label} aria-label={it.label} target="_blank" rel="noreferrer">
                    {content}
                  </a>
                ) : (
                  <Link to={it.link} className={s.iconBtn} title={it.label} aria-label={it.label}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <ul className={cx(s.iconNav, s.iconNavBottom)} aria-label="Secondary navigation (icons only)">
          {bottomItems.map((it) => {
            const icon = this.themeIcons(it.iconKey);
            const content = <img src={icon} alt={it.label} width="24" height="24" />;
            return (
              <li key={it.key} className={s.iconItem}>
                {it.onClick ? (
                  <button type="button" className={s.iconBtn} onClick={it.onClick} title={it.label} aria-label={it.label}>
                    {content}
                  </button>
                ) : (
                  <Link to={it.link} className={s.iconBtn} title={it.label} aria-label={it.label}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  renderFullNav() {
    return (
      <>
        <ul className={s.nav}>
          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="Dashboard"
            isHeader
            link="/app/dashboard"
            index="dashboard"
            exact={false}
            childrenLinks={[
              { header: "Analytics", link: "/app/dashboard/analytics" },
              { header: "Visits", link: "/app/dashboard/visits" },
            ]}
          >
            <img src={this.themeIcons("dashboard")} alt="dashboard" width="24" height="24" />
          </LinksGroup>

          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="생산관리 시스템"
            isHeader
            link="/app/production/chart"
            index="production"
            exact={false}
            childrenLinks={[
              { header: "생산데이터 차트", link: "/app/production/chart" },
              { header: "생산 데이터 그리드", link: "/app/production/grid" },
            ]}
          >
            <img src={this.themeIcons("production")} alt="production" width="24" height="24" />
          </LinksGroup>

          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="금형관리 시스템"
            isHeader
            link="/app/mold/chart"
            index="mold"
            childrenLinks={[
              { header: "금형데이터 차트", link: "/app/mold/chart" },
              { header: "금형세척 데이터", link: "/app/mold/data" },
              { header: "금형타수 데이터", link: "/app/mold/shotCountData" },
              { header: "금형고장 데이터", link: "/app/mold/moldBreakDown" },
            ]}
          >
            <img src={this.themeIcons("mold")} alt="mold" width="24" height="24" />
          </LinksGroup>

          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="불량공정 시스템"
            isHeader
            link="/app/defect/chart"
            index="defect"
            exact={false}
            childrenLinks={[
              { header: "불량공정 차트", link: "/app/defect/chart" },
              { header: "불량공정 그리드", link: "/app/defect/grid" },
            ]}
          >
            <img src={this.themeIcons("defect")} alt="defect" width="24" height="24" />
          </LinksGroup>

          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="비가동 통계 시스템"
            isHeader
            link="/app/downtime/chart"
            index="downtime"
            childrenLinks={[
              { header: "비가동 통계 차트", link: "/app/downtime/chart" },
              { header: "비가동 통계 데이터", link: "/app/downtime/data" },
            ]}
          >
            <img src={this.themeIcons("downtime")} alt="downtime" width="24" height="24" />
          </LinksGroup>

          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="초/중/종품 검사 시스템"
            isHeader
            link="/app/inspection/chart"
            index="inspection"
            childrenLinks={[
              { header: "검사 시스템 차트", link: "/app/inspection/chart" },
              { header: "검사 시스템 데이터", link: "/app/inspection/data" },
            ]}
          >
            <img src={this.themeIcons("inspection")} alt="inspection" width="24" height="24" />
          </LinksGroup>

          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="관리자 시스템"
            isHeader
            link="/admin/users"
            index="admin"
            childrenLinks={[
              { header: "회사/공장/공정 데이터", link: "/admin/users" },
              { header: "공정코드 데이터", link: "/admin/users" },
              { header: "품목 데이터", link: "/admin/users" },
              { header: "사원 관리 데이터", link: "/app/admin/users" },
            ]}
          >
            <img src={this.themeIcons("admin")} alt="admin" width="24" height="24" />
          </LinksGroup>

          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="Email"
            isHeader
            link="/app/email"
            index="email"
            badge={9}
          >
            <img src={this.themeIcons("email")} alt="email" width="24" height="24" />
          </LinksGroup>

          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="Documentation"
            link="/documentation"
            isHeader
            index="documentation"
            target="_blank"
          >
            <img src={this.themeIcons("documentation")} alt="documentation" width="24" height="24" />
          </LinksGroup>
        </ul>

        <ul className={s.downNav}>
          <hr />
          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            header="Settings"
            isHeader
            index="main"
          >
            <img src={this.themeIcons("settings")} alt="settings" width="24" height="24" />
          </LinksGroup>
          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            header="Account"
            isHeader
            link={"/app/profile"}
          >
            <img src={this.themeIcons("profile")} alt="account" width="24" height="24" />
          </LinksGroup>
          <LinksGroup
            onActiveSidebarItemChange={(activeItem) => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            header="Logout"
            isHeader
            onClick={() => this.doLogout()}
          >
            <img src={this.themeIcons("logout")} alt="logout" width="24" height="24" />
          </LinksGroup>
        </ul>
      </>
    );
  }

  render() {
    // static 모드에선 접히지 않음
    const isCollapsed = !this.props.sidebarOpened && !this.props.sidebarStatic;

    return (
      <div
        className={`${isCollapsed ? s.sidebarClose : ""} ${s.sidebarWrapper} ${cx({
          "bg-transparent shadow-none": this.props.sidebarType === "transparent",
        })}`}
        id="sidebar-drawer"
      >
        <nav
          className={`${s.root} ${cx({
            "bg-transparent": this.props.sidebarType === "transparent",
          })}`}
        >
          {/* 닫힘=글자 포함 로고 / 열림=심볼 로고 */}
          <header
            className={s.logo}
            onClick={this.handleLogoClick}
            onKeyDown={this.handleLogoKeyDown}
            role="button"
            tabIndex={0}
            title={isCollapsed ? "사이드바 열기" : "사이드바 닫기"}
            aria-label={isCollapsed ? "사이드바 열기" : "사이드바 닫기"}
          >
            <img src={AJIN_logo_white_background} alt="AJIN INDUSTRIAL" className={`${s.logoImg} ${s.logoFull}`} />
            <img src={logo} alt="AJIN Logo Mark" className={`${s.logoImg} ${s.logoMark}`} />
          </header>

          <section className={s.menuWrapper}>
            {/* 펼침: 풀 내비, 접힘: 아이콘 전용 내비 */}
            {isCollapsed ? this.renderIconOnlyNav() : this.renderFullNav()}
          </section>
        </nav>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
    alertsList: store.alerts.alertsList,
    activeItem: store.navigation.activeItem,
    navbarType: store.navigation.navbarType,
    sidebarColor: store.layout.sidebarColor,
    sidebarType: store.layout.sidebarType,
    themeColor: store.layout.themeColor,
  };
}

export default withRouter(connect(mapStateToProps)(Sidebar));
