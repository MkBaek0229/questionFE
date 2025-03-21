import Footer from "./Footer";
import Header from "./Header";

function Layout({ children, isExpertLoggedIn }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        className="fixed top-0 left-0 right-0 h-16 z-50"
        isExpertLoggedIn={isExpertLoggedIn}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
