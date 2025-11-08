import BrandBuilder from './pages/BrandBuilder';
import MVPCreator from './pages/MVPCreator';
import Welcome from './pages/Welcome';
import LoopBuilder from './pages/LoopBuilder';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import InvestorHub from './pages/InvestorHub';
import AdminHub from './pages/AdminHub';
import Dashboard from './pages/Dashboard';
import Marketing from './pages/Marketing';
import Documentation from './pages/Documentation';
import Training from './pages/Training';
import Legal from './pages/Legal';
import LogoGenerator from './pages/LogoGenerator';
import SetupGuide from './pages/SetupGuide';
import RevenueTracking from './pages/RevenueTracking';
import Knowledge from './pages/Knowledge';
import MVPBuilderPreview from './pages/MVPBuilderPreview';
import ContactHub from './pages/ContactHub';
import LegalDocumentGenerator from './pages/LegalDocumentGenerator';
import AutomationHub from './pages/AutomationHub';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import CloudDeployment from './pages/CloudDeployment';
import Layout from './Layout.jsx';


export const PAGES = {
    "BrandBuilder": BrandBuilder,
    "MVPCreator": MVPCreator,
    "Welcome": Welcome,
    "LoopBuilder": LoopBuilder,
    "Pricing": Pricing,
    "Profile": Profile,
    "InvestorHub": InvestorHub,
    "AdminHub": AdminHub,
    "Dashboard": Dashboard,
    "Marketing": Marketing,
    "Documentation": Documentation,
    "Training": Training,
    "Legal": Legal,
    "LogoGenerator": LogoGenerator,
    "SetupGuide": SetupGuide,
    "RevenueTracking": RevenueTracking,
    "Knowledge": Knowledge,
    "MVPBuilderPreview": MVPBuilderPreview,
    "ContactHub": ContactHub,
    "LegalDocumentGenerator": LegalDocumentGenerator,
    "AutomationHub": AutomationHub,
    "PaymentSuccess": PaymentSuccess,
    "PaymentCancelled": PaymentCancelled,
    "CloudDeployment": CloudDeployment,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: Layout,
};