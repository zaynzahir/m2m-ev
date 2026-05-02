import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service | M2M Network",
  description:
    "Terms governing use of the M2M Network DePIN Solana charging application and protocol interfaces.",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated="April 4, 2026">
      <p>
        These Terms of Service (“Terms”) govern your access to and use of the
        M2M Network website, applications, and related interfaces (the
        “Services”) operated by M2M Network (“M2M,” “we,” “us,” or “our”). By
        accessing or using the Services, you agree to these Terms.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be able to form a binding contract in your jurisdiction and
        use the Services only in compliance with applicable laws. If you use the
        Services on behalf of an organization, you represent that you have
        authority to bind that organization.
      </p>

      <h2>2. Decentralization and peer to peer nature</h2>
      <p>
        M2M provides software interfaces, protocol tooling, and oracle related
        functionality to help participants discover charging capacity and
        coordinate sessions.{" "}
        <strong>
          M2M is not a party to agreements between drivers and hosts.
        </strong>{" "}
        Charging arrangements, pricing, access to physical premises, and
        performance of charging equipment are{" "}
        <strong>peer to peer</strong> between you and other users. You are
        responsible for your own decisions and interactions.
      </p>

      <h2>3. Escrow and settlement (Solana)</h2>
      <p>
        Certain flows may involve locking or transferring digital assets on
        Solana using smart contracts or program instructions.{" "}
        <strong>
          Settlement behavior depends on on chain program logic and oracle
          inputs
        </strong>{" "}
        such as session verification and reconciliation. M2M does not guarantee
        uninterrupted network availability, transaction inclusion, or specific
        outcomes. Fees, slippage, and network congestion may apply. You are
        solely responsible for securing your wallet keys and approving
        transactions.
      </p>

      <h2>4. Host liability and safety</h2>
      <p>
        <strong>
          Hosts are responsible for the safety, legality, and condition of their
          charging hardware, electrical installations, and premises.
        </strong>{" "}
        M2M does not inspect or certify equipment. You must comply with local
        codes, insurance requirements, and manufacturer instructions. To the
        maximum extent permitted by law, M2M disclaims liability for property
        damage, injury, or loss arising from use of third party hardware or
        locations.
      </p>

      <h2>5. Beta software and Devnet</h2>
      <p>
        <strong>
          The Services are provided as a beta (V1) reference implementation and
          may operate on Solana Devnet or similar test environments.
        </strong>{" "}
        Features, economics, and security assumptions may change.{" "}
        <strong>
          Do not rely on the Services for production or high value use without
          independent review.
        </strong>{" "}
        Data may be reset; assets on test networks have no mainnet value.
      </p>

      <h2>6. Prohibited conduct</h2>
      <p>You agree not to misuse the Services, including by:</p>
      <ul>
        <li>Violating any law or third party rights;</li>
        <li>
          Attempting to probe, scan, or disrupt the Services or other users;
        </li>
        <li>
          Submitting false telemetry or manipulating oracle or session flows;
        </li>
        <li>Using the Services to distribute malware or spam.</li>
      </ul>

      <h2>7. Intellectual property</h2>
      <p>
        The Services, branding, and documentation are owned by M2M or its
        licensors. Open source components are subject to their respective
        licenses. Subject to those licenses, you may not copy or exploit our
        materials without permission.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        <strong>
          THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT
          WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </strong>{" "}
        We do not warrant that the Services will be error free, secure, or
        uninterrupted.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law,{" "}
        <strong>
          M2M and its contributors shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or any loss
          of profits, data, or goodwill
        </strong>
        , arising from your use of the Services or the protocol. In no event
        shall our aggregate liability exceed the greater of one hundred U.S.
        dollars (USD $100) or the amounts you paid M2M for the Services in the
        twelve months preceding the claim (if any).
      </p>

      <h2>10. Indemnity</h2>
      <p>
        You will defend and indemnify M2M and its affiliates against claims
        arising from your use of the Services, your charging equipment or
        vehicle, or your violation of these Terms.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may modify these Terms at any time. We will post the updated Terms
        and revise the “Last updated” date. Continued use after changes
        constitutes acceptance.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction specified in
        future published versions or, if none is specified, the laws of the
        State of Delaware, USA, excluding conflict of law rules.
      </p>

      <h2>13. Contact</h2>
      <p>
        Email{" "}
        <a
          href="mailto:info@m2m.energy"
          className="text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary/90"
        >
          info@m2m.energy
        </a>{" "}
        for Terms questions. Supplemental context may appear in the{" "}
        <a
          href="https://github.com/zaynzahir/m2m-ev"
          className="text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary/90"
          rel="noopener noreferrer"
          target="_blank"
        >
          public repository
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
