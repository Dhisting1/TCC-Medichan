import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

// ── paleta do protótipo ──────────────────────────────────────────────────────
const TEAL   = "#0B3530";
const LIME   = "#CBE54E";
const BG     = "#F0F2F0";
const WHITE  = "#FFFFFF";

// ── nav items por role ───────────────────────────────────────────────────────
const NAV: Record<string, { label: string; icon: string; path: string }[]> = {
  DOCTOR: [
    { label: "Home",              icon: "⊞", path: "/doctor" },
    { label: "Nova prescrição",   icon: "✎", path: "/doctor/new" },
    { label: "Minhas prescrições",icon: "📋", path: "/doctor/history" },
  ],
  PHARMACY: [
    { label: "Home",            icon: "⊞", path: "/pharmacy" },
    { label: "Validar receita", icon: "🔍", path: "/pharmacy" },
  ],
  PATIENT: [
    { label: "Home",              icon: "⊞", path: "/patient" },
  ],
  ADMIN: [
    { label: "Home",              icon: "⊞", path: "/admin" },
    { label: "Usuários",          icon: "👥", path: "/admin" },
  ],
};

// ── styled components ────────────────────────────────────────────────────────
const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${BG};
  font-family: 'Segoe UI', sans-serif;
`;

const Sidebar = styled.aside`
  width: 220px;
  min-height: 100vh;
  background: ${TEAL};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const Logo = styled.div`
  padding: 28px 24px 32px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogoText = styled.span`
  font-size: 22px;
  font-weight: 800;
  color: ${WHITE};
  letter-spacing: -0.5px;
`;

const LogoPlus = styled.span`
  font-size: 24px;
  color: ${LIME};
  font-weight: 900;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 0 0 16px;
`;

const NavItem = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 24px;
  background: none;
  border: none;
  border-left: 3px solid ${p => p.active ? WHITE : "transparent"};
  color: ${p => p.active ? WHITE : "rgba(255,255,255,0.5)"};
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  &:hover { color: ${WHITE}; background: rgba(255,255,255,0.06); }
`;

const NavIcon = styled.span`
  font-size: 16px;
  width: 20px;
  text-align: center;
`;

const SairBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 16px 24px;
  background: none;
  border: none;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  &:hover { color: ${WHITE}; }
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.header`
  background: ${WHITE};
  padding: 18px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
`;

const Welcome = styled.span`
  font-size: 15px;
  color: #374151;
  font-weight: 500;
`;

const UserBadge = styled.span`
  font-size: 12px;
  padding: 4px 12px;
  background: ${TEAL};
  color: ${LIME};
  border-radius: 99px;
  font-weight: 600;
`;

const Content = styled.div`
  flex: 1;
  padding: 32px;
`;

// ── componente ────────────────────────────────────────────────────────────────
export default function Layout({ children }: any) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = NAV[user?.role || "PATIENT"] || [];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <Shell>
      <Sidebar>
        <Logo>
          <LogoText>Medichain</LogoText>
          <LogoPlus>✛</LogoPlus>
        </Logo>

        <Nav>
          {navItems.map(item => (
            <NavItem
              key={item.path}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <NavIcon>{item.icon}</NavIcon>
              {item.label}
            </NavItem>
          ))}
        </Nav>

        <SairBtn onClick={handleLogout}>
          <span>↪</span> Sair
        </SairBtn>
      </Sidebar>

      <Main>
        <TopBar>
          <Welcome>Bem-vindo, <strong>"{user?.email}"</strong></Welcome>
          <UserBadge>{user?.role}</UserBadge>
        </TopBar>
        <Content>{children}</Content>
      </Main>
    </Shell>
  );
}
