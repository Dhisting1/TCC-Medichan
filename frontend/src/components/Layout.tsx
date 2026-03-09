import styled from "styled-components";

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
`;

export default function Layout({ children }: any) {
  return (
    <Container>
      <Title>MediChain</Title>
      {children}
    </Container>
  );
}
