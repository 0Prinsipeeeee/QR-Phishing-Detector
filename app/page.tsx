import QRHomePage from "./views/index";
import TestRoute from "./views/testRoute/page";
import Link from 'next/link'

export default function Home() {
  return <QRHomePage />;

}
export function Test() {
  return <TestRoute />;
}