/** Qora routing — marketing, merchant dashboard, customer storefront, and blog. */
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Auth from "./pages/Auth";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import StoresDirectory from "./pages/StoresDirectory";
import Storefront from "./pages/Storefront";
import OrderCheckout from "./pages/OrderCheckout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/stores" component={StoresDirectory} />
      <Route path="/explore" component={StoresDirectory} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/login" component={Auth} />
      <Route path="/register" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/store/:slug" component={Storefront} />
      <Route path="/store/:slug/p/:productSlug" component={Storefront} />
      <Route path="/pay/:orderNumber" component={OrderCheckout} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
