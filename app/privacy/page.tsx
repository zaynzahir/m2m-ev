import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | M2M Network",
  description:
    "How M2M Network collects, uses, and protects data in our Solana DePIN charging protocol.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated="April 4, 2026">
      <p>
        This Privacy Policy describes how M2M Network (“M2M,” “we,” “us,” or
        “our”) handles information when you use our web application, protocol
        interfaces, and related services (collectively, the “Services”). By using
        the Services, you acknowledge this policy.
      </p>

      <h2>1. Scope</h2>
      <p>
        M2M is a Decentralized Physical Infrastructure Network (DePIN) that
        connects electric vehicle (EV) drivers with charging capacity. Some
        processing occurs on public blockchains and through third party
        infrastructure; those systems have their own privacy practices.
      </p>

      <h2>2. Information we collect</h2>

      <h3>2.1 Wallet and on chain data</h3>
      <p>
        When you connect a Solana wallet, we process your public wallet address
        and may display it in the interface. On chain transactions, balances, and
        program interactions are recorded on Solana public ledgers and are not
        controlled by M2M.
      </p>

      <h3>2.2 Account and authentication</h3>
      <p>
        If you sign up with email, OAuth providers such as Google, or similar
        methods, our hosted authentication service processes identifiers such as
        your email address, provider metadata, and session identifiers needed
        for login, password reset, and account security. We use this data to
        maintain your profile and sync it with application data stored in our
        database.
      </p>

      <h3>2.3 Vehicle and charging telemetry</h3>
      <p>
        To operate sessions, reconciliation, and safety features, we may process
        data such as vehicle model or identifiers you provide, energy related
        readings from integrated vehicle APIs where you grant access, and
        charger reported status (plug state, session energy, identifiers) via
        partner APIs or networked chargers when you enable those integrations.
        Categories processed depend on your actions and integrations in your
        jurisdiction.
      </p>

      <h3>2.4 Location and map usage</h3>
      <p>
        When you use map features, we may process approximate or precise
        location as provided by your browser or device and by our mapping
        provider such as Mapbox to show chargers and routes. You can control
        location permissions in your device or browser settings.
      </p>

      <h3>2.5 Technical and usage data</h3>
      <p>
        We may collect logs, device and browser type, IP address, and usage
        events to secure the Services, debug issues, and understand aggregate
        usage patterns.
      </p>

      <h2>3. Oracle and infrastructure providers</h2>
      <p>
        M2M dual verification oracle services may process telemetry from
        chargers and vehicles to reconcile energy delivery as integrations go
        live. That processing is limited to operating the protocol, displaying
        session status, and settlement flows described in our documentation.
        Partner APIs, indexers, and node operators may process data according
        to their own terms.
      </p>

      <h2>4. How we use information</h2>
      <p>We use the information above to:</p>
      <ul>
        <li>Provide, maintain, and improve the Services;</li>
        <li>Authenticate users and link wallets to profiles where applicable;</li>
        <li>Facilitate charging sessions, QR verification, and escrow related flows;</li>
        <li>Communicate about security, support, and important notices;</li>
        <li>Comply with law and enforce our terms.</li>
      </ul>

      <h2>5. Sharing</h2>
      <p>
        We may share data with service providers including hosting, database,
        authentication, mapping, or analytics vendors under contractual
        safeguards.
        Blockchain data is inherently public. We may disclose information if
        required by law or to protect rights and safety.
      </p>

      <h2>6. Retention</h2>
      <p>
        We retain information as long as needed for the purposes above and as
        required by law. On chain records may persist permanently on Solana.
      </p>

      <h2>7. Security</h2>
      <p>
        We implement reasonable technical and organizational measures. No method
        of transmission or storage is 100% secure; you use the Services at your
        own risk.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct,
        delete, or restrict processing of personal data, or to object or
        port data. Contact us to exercise applicable rights.
      </p>

      <h2>9. International users</h2>
      <p>
        If you access the Services from outside the United States, your
        information may be processed in the United States or other countries
        where we or our providers operate.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. The “Last updated”
        date reflects the current version. Continued use after changes
        constitutes acceptance of the updated policy.
      </p>

      <h2>11. Contact</h2>
      <p>
        For privacy questions email{" "}
        <a
          href="mailto:info@m2m.energy"
          className="text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary/90"
        >
          info@m2m.energy
        </a>
        . You may also review public materials linked from{" "}
        <a
          href="https://github.com/zaynzahir/m2m-ev"
          className="text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary/90"
          rel="noopener noreferrer"
          target="_blank"
        >
          the open source repository
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
