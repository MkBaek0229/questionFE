import Nav from "./Nav";

function Layout({ children, isExpertLoggedIn }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav
        className="fixed top-0 left-0 right-0 h-16 z-50"
        isExpertLoggedIn={isExpertLoggedIn}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default Layout;
