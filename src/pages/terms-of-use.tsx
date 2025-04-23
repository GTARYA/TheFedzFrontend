import Head from 'next/head';
import TermsSection from '../components/terms-of-use/SectionTerms';
import TermsTitle from '../components/terms-of-use/TermsTitle';
import TermsText from '../components/terms-of-use/TermsText';
import PointList from '../components/terms-of-use/PointList';
import { Point } from '../components/terms-of-use/Point';

export default function TermsOfUse() {
    return (
        <>
            <Head>
                <title>The Fedz - Terms of Use</title>
            </Head>
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-800">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    The Fedz – Website Terms and Conditions
                </h1>
                <p className="text-sm text-gray-500 mb-10 text-center">
                    Last Updated: 23.04.2025
                </p>

                <section className="space-y-4 mb-8">
                    <p>
                        Welcome to{' '}
                        <a
                            className="text-blue-600 underline"
                            href="/"
                            target="_blank">
                            TheFedz.org
                        </a>{' '}
                        (the <b>“Platform”</b>), operated by The Fedz Foundation
                        (<b>“we,”</b>
                        <b>“us,”</b> or <b>“our”</b>). These Terms and
                        Conditions (the
                        <b>“Terms”</b>) set forth the legally binding conditions
                        governing access to and use of the Platform and the
                        Services offered on the Platform By utilizing the
                        Platform, you acknowledge that you have carefully
                        reviewed, understood, and agreed to be bound by these
                        Terms, as well as our Privacy Policy
                    </p>
                </section>
                <TermsSection>
                    <TermsTitle>1. DEFINITIONS</TermsTitle>
                    <TermsText>
                        The following terms shall have the meaning ascribed to
                        them below:
                    </TermsText>
                    <PointList>
                        <Point>
                            <strong>”Blog”</strong> The Blog operated by us,
                            available at{' '}
                            <a
                                href="https://blog.thefedz.org/"
                                target="_blank"
                                className="text-blue-600 underline">
                                https://blog.thefedz.org/
                            </a>
                        </Point>
                        <Point>
                            <strong>”FUSD”</strong> means a stablecoin, i.e. a
                            cryptocurrency, issued by the us
                        </Point>
                        <Point>
                            <strong>”USDT”</strong> means a stablecoin, i.e. a
                            cryptocurrency, issued by “Tether”
                        </Point>
                        <Point>
                            <strong>“NFT”</strong> means non-fungible tokens
                            that can be minted by users on the Platform
                        </Point>
                        <Point>
                            <strong> “Private Pool”</strong> means the exclusive
                            trading pool accessible only to certain NFT holders
                            and which allows them to trade FUSD and USDT.
                        </Point>
                        <Point>
                            <strong>“Services”</strong> means access to the
                            Platform, minting NFTs, trade in and redemption of
                            FUSD, access and use of the Blog, and all other
                            services made available to users of the Platform
                            from time to time.
                        </Point>
                        <Point>
                            <strong>“Trading Restrictions”</strong> means the
                            limitations on trading activities with respect to
                            FUSD as specified in these Terms, as may be amended
                            by us from time to time.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>2. ACCEPTANCE OF TERMS</TermsTitle>
                    <TermsText>
                        By accessing the Platform and linking your blockchain
                        wallet, you affirm that you possess the legal authority
                        to enter into a binding contractual agreement and that
                        you consent to comply with these Terms in full. Should
                        you object to any provision contained herein, you are
                        expressly prohibited from accessing or utilizing the{' '}
                        <a
                            className="text-blue-600 underline"
                            href="/"
                            target="_blank">
                            Platform
                        </a>
                        . Your continued use of the Platform signifies your
                        acceptance of any modifications to these Terms that may
                        be implemented from time to time. Users will be notified
                        of any significant changes via the Platform or our
                        Telegram before such modifications take effect. We
                        reserve the right to modify, amend, or update these
                        Terms at any time in its sole discretion to comply with
                        applicable laws, technological developments, business
                        operations, or other necessary conditions.
                    </TermsText>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>3. ELIGIBILITY</TermsTitle>
                    <TermsText>
                        To be eligible to use the Platform, you must:
                    </TermsText>
                    <PointList>
                        <Point>
                            Be at least 18 years of age or meet the legal age of
                            majority in your jurisdiction.
                        </Point>
                        <Point>
                            Have full legal capacity to enter into enforceable
                            contracts.
                        </Point>

                        <Point>
                            Not be a resident or national of a jurisdiction
                            where participation in activities facilitated by the
                            Platform is prohibited or restricted by applicable
                            law.
                        </Point>
                        <Point>
                            Not be a resident or located in the United States or
                            any U.S. territories.
                        </Point>
                        <Point>
                            Not have been previously suspended or removed from
                            the Platform for violations of these Terms or for
                            engaging in fraudulent, abusive, or unlawful
                            activities.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>4. BLOCKCHAIN WALLET INTEGRATION</TermsTitle>
                    <PointList>
                        <Point>
                            Users must link a compatible blockchain wallet to
                            access functionalities such as minting, trading, and
                            redeeming FUSD.
                        </Point>
                        <Point>
                            We do not maintain custody of users’ private keys
                            and shall not be liable for the security, loss, or
                            compromise of such credentials.
                        </Point>
                        <Point>
                            Users bear sole responsibility for safeguarding
                            their private keys and ensuring the security of
                            their wallet credentials
                        </Point>
                        <Point>
                            We do not have custody or control over your wallet
                            or its contents, and we cannot retrieve or transfer
                            its contents.
                        </Point>
                        <Point>
                            Any unauthorized access to a user’s wallet is the
                            sole responsibility of the user, and we disclaim any
                            liability for loss of assets due to theft, hacking,
                            or unauthorized use
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>5. MINTING OF NFT</TermsTitle>
                    <PointList>
                        <Point>
                            Users may mint NFT only through the Platform and
                            only after paying the NFT price, as will be set by
                            us.
                        </Point>
                        <Point>
                            An NFT holder may receive a certain amount of FUSD
                            for the purpose of trading it within the Private
                            Pool. We reverse the right to decide, at our sole
                            discretion, if, when and what amount of FUSD each
                            NFT holder may receive
                        </Point>
                        <Point>
                            We reserve the right to amend or modify the minting
                            mechanisms at its discretion without prior notice.
                        </Point>

                        <Point>
                            You acknowledge and agree that the NFT is provided
                            "as-is" without any guarantees of functionality,
                            reliability, or suitability for any specific
                            purpose. You further understand that as an NFT
                            holder you will solely be granted the righ
                        </Point>
                        <Point>
                            Owning an NFT grants only the right to own the NFT
                            and does not confer any additional rights, benefits,
                            or entitlements, including but not limited to
                            intellectual property rights, com
                        </Point>
                        <Point>
                            The sale, transfer, or assignment of an NFT does not
                            convey, assign, or transfer any associated rights,
                            benefits, or privileges that may have been
                            previously available to the original holder. Any
                            such rights, if granted, are non-transferable and
                            remain subject to our sole discretion. We reserve
                            the right to m
                        </Point>
                        <Point>
                            We reserve the right, at our sole discretion, to
                            grant, withhold, modify, or revoke any derivative
                            rights, privileges, or benefits associated with the
                            NFT, including the right to selectively exclude,
                            restrict, or deny access to certain holders without
                            obligation to provide justification.
                        </Point>
                        <Point>
                            By using the Platform, you waive any claims
                            regarding the NFT's performance, utility, commercial
                            viability or privileges beyond mere ownership of the
                            NFT.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>6. ACCESS TO PRIVATE POOL</TermsTitle>
                    <PointList>
                        <Point>
                            NFT holders may gain exclusive access to the Private
                            Pool subject to these Terms
                        </Point>
                        <Point>
                            The mere possession of an NFT does not automatically
                            grant access to the Private Pool. We reserve the
                            right to decide, at our sole discretion and for any
                            reason whatsoever, to impose additional conditions,
                            restrictions, or eligibility requirements for
                            accessing the Private Pool. This includes, but is
                            not limited to, selective admission, exclusion of
                            specific NFT holders, or modification of access
                            criteria without prior notice
                        </Point>
                        <Point>
                            Trading of FUSD within the Private Pool may be
                            subject to any Trading Restrictions as may be
                            implemented by us from time to time, without any
                            prior notice.
                        </Point>
                        <Point>
                            You acknowledge and agree that, the position of an
                            NFT, does not grant any legal claim, right,
                            expectation, or entitlement to access or participate
                            in the Private Pool. Access to the Private Pool
                            remains subject to our sole and absolute discretion,
                            and we reserve the right to impose additional
                            conditions, restrictions, or eligibility criteria at
                            any time without prior notice.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>7. TRADING OF FUSD</TermsTitle>
                    <PointList>
                        <Point>
                            Trading of FUSD is exclusively restricted to
                            transactions between users on the Platform.
                        </Point>
                        <Point>
                            All the trading activities are conducted by smart
                            contracts, which are computer code that
                            automatically executes all or parts of an agreement
                            and is stored on a blockchain network
                        </Point>
                        <Point>
                            Trading activities are subject to the following
                            restrictions and conditions:
                            <ul className="list-decimal ml-10">
                                <li>
                                    Users are not allowed to trade The Fedz’ NFT
                                    until further notice
                                </li>
                            </ul>
                        </Point>
                        <Point>
                            We reserve the right, at our sole discretion and
                            without any prior notice, to amend the properties of
                            the smart contracts that are deployed by us to
                            facilitate trading activity.
                        </Point>
                        <Point>
                            We may amend the Trading Restrictions from time to
                            time, at our sole discretion.
                        </Point>
                        <Point>
                            We provide no guarantees regarding liquidity,
                            pricing stability, or execution of trades.
                        </Point>
                        <Point>
                            Users engaging in trading activities do so at their
                            own risk, and we are not responsible for market
                            fluctuations or trading losses.
                        </Point>
                        <Point>
                            By engaging in any trading activities involving
                            FUSD, you acknowledge and accept that FUSD is an
                            experimental asset with no guarantee of value, price
                            stability, or exchange rate predictability. The
                            value of FUSD may fluctuate significantly, whether
                            temporarily or permanently.
                        </Point>
                        <Point>
                            You acknowledge that since the trading activity is
                            performed using a set of smart contracts,
                            transactions automatically execute and settle, and
                            that blockchain-based transactions are irreversible
                            when confirmed.
                        </Point>
                        <Point>
                            By using the Platform, you expressly waive any
                            claims, demands, or causes of action against the
                            platform, its affiliates, and associated parties
                            concerning FUSD’s value, price, or stability rate,
                            regardless of any fluctuations, volatility, or
                            losses incurred.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>8. REDEMPTION OF FUSD</TermsTitle>
                    <PointList>
                        <Point>
                            We reserve the right, in our sole discretion, to
                            modify, restrict, or withdraw liquidity of FUSD at
                            any time and under any conditions, without prior
                            notice. Such modifications may result in the
                            complete or partial loss of FUSD’s value. You
                            understand and accept that you may lose all funds
                            associated with FUSD, and we shall bear no liability
                            for any losses incurred as a result.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>9. ACCESS TO THE BLOG</TermsTitle>
                    <PointList>
                        <Point>
                            You may access and interact with the Blog.
                        </Point>
                        <Point>
                            Any use of the Blog is subject to compliance with
                            content guidelines implemented by us from time to
                            time.
                        </Point>
                        <Point>
                            Users acknowledge that we may monitor any and all
                            information included in the Blog, including comments
                            and reactions, in order to verify compliance with
                            its policies and guidelines.
                        </Point>
                        <Point>
                            Breach of our policies and guidelines may result in
                            suspension or termination of access to the Blog
                            and/or deletion of content.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>
                        10. COMPLIANCE AND REGULATORY OBLIGATIONS
                    </TermsTitle>
                    <PointList>
                        <Point>
                            Users are solely responsible for ensuring that their
                            activities on the Platform adhere to all applicable
                            laws and regulations within their respective
                            jurisdictions
                        </Point>
                        <Point>
                            We reserve the right to impose additional compliance
                            measures, including Know Your Customer (KYC) and
                            Anti-Money Laundering (AML) verifications.
                        </Point>
                        <Point>
                            Users may be required to furnish additional
                            information to maintain compliance with legal
                            obligations.
                        </Point>
                        <Point>
                            We may, at our sole discretion, freeze or restrict
                            accounts suspected of engaging in fraudulent,
                            illegal, or non-compliant activities. However, due
                            to the decentralized nature of the Platform, we may
                            not be able to do so, and therefore, we disclaim any
                            warranty that such actions may be taken by us and
                            any liability with respect to any losses incurred by
                            Users in connection with the fact that we did not
                            take such actions.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>
                        11. USER REPRESENTATIONS AND WARRANTIES
                    </TermsTitle>
                    <TermsText>
                        By utilizing the Platform, you expressly represent and
                        warrant that:
                    </TermsText>
                    <PointList>
                        <Point>
                            You will engage with the Platform solely for lawful
                            and legitimate purposes, refraining from any
                            fraudulent, unethical, unlawful or illicit
                            activities.
                        </Point>
                        <Point>
                            You are not a U.S. citizen, resident, or entity, nor
                            are you accessing the Platform from within the
                            United States
                        </Point>
                        <Point>
                            {' '}
                            You are not listed on any governmental or regulatory
                            blacklist, such as the U.S. Department of the
                            Treasury's Office of Foreign Assets Control (OFAC)
                            Specially
                        </Point>
                        <Point>
                            Designated Nationals and Blocked Persons List (SDN
                            List), the European Union's Consolidated List of
                            Sanctions, the Financial Action Task Force (FATF)
                            High-Risk and
                        </Point>
                        <Point>
                            Other Monitored Jurisdictions list, or any other
                            similar list that would restrict or prohibit my
                            ability to legally engage in trading activities on
                            this platform.
                        </Point>
                        <Point>
                            You are not subject to any trading restrictions or
                            sanctions imposed by any relevant authority that
                            would prevent you from participating in trading
                            activities on the Platform
                        </Point>
                        <Point>
                            You assume full responsibility for complying with
                            all applicable tax obligations arising from your
                            activities on the Platform.
                        </Point>
                        <Point>
                            You acknowledge that we expressly disclaim all
                            liability for any user’s failure to comply with
                            applicable laws, including AML, counter-terrorism
                            financing, and financial crime regulations.
                        </Point>
                        <Point>
                            You agree to indemnify and hold us harmless from any
                            claims, liabilities, or penalties arising from your
                            violation of these representations.
                        </Point>
                        <Point>
                            You understand that your activities may be monitored
                            for compliance and that any violations may result in
                            suspension or termination of access to the Platform
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>12. USER RESPONSIBILITIES</TermsTitle>
                    <PointList>
                        <Point>
                            Users undertake to promptly notify us in writing if
                            any of the representations in Section 11 become
                            untrue in the future.
                        </Point>
                        <Point>
                            Users are responsible for maintaining the
                            confidentiality of their account credentials and for
                            all activities that occur under their account. We
                            disclaim any liability for unauthorized access
                            resulting from user negligence.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>13. RISK DISCLOSURE</TermsTitle>
                    <PointList>
                        <Point>
                            The holding and trading of FUSD and other
                            cryptocurrencies involves significant risks,
                            including but not limited to extreme price
                            volatility, regulatory uncertainties, technological
                            vulnerabilities, and potential cyber threats. Users
                            should be aware that the value of cryptocurrencies
                            can fluctuate dramatically, and there is a risk of
                            total loss of value
                        </Point>
                        <Point>
                            FUSD is an experimental cryptocurrency, and you
                            acknowledge that the value can fluctuate
                            significantly, whether temporarily or permanently,
                            and you accept that you may lose all funds
                            associated with FUSD, and we shall bear no liability
                            for any losses incurred as a result.
                        </Point>
                        <Point>
                            Regulatory changes or actions may adversely affect
                            the use, transfer, exchange, and value of
                            cryptocurrencies.
                        </Point>
                        <Point>
                            We do not offer investment, financial, or trading
                            advice. Users acknowledge and assume full
                            responsibility for all risks associated with their
                            trading decisions.
                        </Point>
                        <Point>
                            Users should conduct independent research and
                            consult with financial professionals before engaging
                            in transactions involving FUSD, NFTs, trading
                            activities or any other activity conducted on the
                            Platform.
                        </Point>
                        <Point>
                            FUSD is not a security or any other financial
                            instrument, and the purchase of FUSD is not an
                            investment in security or any other financial
                            instrument. You acknowledge that we cannot and do
                            not guarantee FUSD’s or the NFT’s value.
                        </Point>
                        <Point>
                            The Company may utilize third-party service
                            providers for technical operations. The Company
                            shall not be liable for any damage, losses, or
                            financial harm arising from technical malfunctions,
                            failures, or any other issues related to the
                            services of such third-party providers, including
                            but not limited to service interruptions, data
                            breaches, or system failures.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>14. INTELLECTUAL PROPERTY RIGHTS</TermsTitle>
                    <PointList>
                        <Point>
                            All content, code, designs, trademarks, patents,
                            trade secrets, and any other intellectual property
                            relating to the Platform (collectively, the
                            “Platform’s IP”) are our sole and exclusive
                            property.
                        </Point>
                        <Point>
                            By submitting, posting, or displaying any content on
                            the Platform (including the Blog), the user grants
                            the us a perpetual, irrevocable, worldwide,
                            non-exclusive, royalty-free, sublicensable, and
                            transferable license to use, modify, reproduce,
                            distribute, or otherwise exploit such content.
                        </Point>
                        <Point>
                            Users acknowledge that any derivative work,
                            modifications, improvements, or adaptations to our
                            IP and/or which are related to the Platform and the
                            Services remain our exclusive property
                        </Point>
                        <Point>
                            Users may not copy, modify, distribute, or
                            reverse-engineer any part of the Platform without
                            our express written consent.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>15. LIMITATION OF LIABILITY</TermsTitle>
                    <PointList>
                        <Point>
                            We, our affiliates, and service providers shall not
                            be liable for any direct, indirect, incidental,
                            consequential, or punitive damage arising from the
                            use of the Platform, including but not limited to
                            damage resulting from technological failures,
                            security reaches, unauthorized access,
                            cyber-attacks, or any other events beyond our
                            reasonable control.
                        </Point>
                        <Point>
                            We disclaim all liability for any losses incurred
                            due to market fluctuations, trading errors, or
                            disruptions in service, including those caused by
                            third-party service providers or blockchain network
                            issues.
                        </Point>
                        <Point>
                            We expressly disclaim liability for any user
                            violations of AML, sanctions, or financial crime
                            regulations and reserve the right to cooperate with
                            law enforcement agencies when required.
                        </Point>
                        <Point>
                            Users assume all risks associated with their
                            activities on the Platform and agree to release us
                            from any claims arising from trading losses or
                            unforeseen disruptions.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>16. DISCLAIMER OF WARRANTIES</TermsTitle>
                    <PointList>
                        <Point>
                            The Platform and all related services are provided
                            strictly on an “as is” and “as available” basis,
                            without any warranties, express or implied.
                        </Point>
                        <Point>
                            We make no representations or warranties regarding
                            the uninterrupted availability, security, accuracy,
                            or reliability of the Platform, including any
                            technological trading solutions or integrations with
                            third-party services.
                        </Point>
                        <Point>
                            We disclaim all warranties related to
                            merchantability, fitness for a particular purpose,
                            non-infringement, and any warranties arising from
                            the course of dealing or usage of trade.
                        </Point>
                        <Point>
                            Users acknowledge that the use of the Platform
                            involves inherent risks associated with digital and
                            blockchain technologies, and we do not guarantee the
                            accuracy or timeliness of data or information
                            provided through the Platform.
                        </Point>
                        <Point>
                            Users acknowledge and agree that the platform may
                            utilize third-party tools, whether open-source or
                            proprietary, which have not been independently
                            verified by the platform. The platform does not
                            warrant or guarantee the security, accuracy, or
                            reliability of such tools, and users understand that
                            the use of these tools may result in a loss of funds
                            or other adverse financial consequences. By engaging
                            in transactions on the platform, users accept and
                            assume all risks associated with the use of these
                            third-party tools
                        </Point>
                        <Point>ffdsfdsf</Point>
                        <Point>ffdsfdsf</Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>17. INDEMNIFICATION</TermsTitle>
                    <PointList>
                        <Point>
                            Users agree to indemnify, defend, and hold harmless
                            us, our affiliates, officers, directors, employees,
                            and agents from and against any claims, damages,
                            losses, liabilities, costs, and expenses (including
                            legal fees) arising from:
                            <ul className="list-decimal ml-10">
                                <li>Their use of the Platform.</li>
                                <li>
                                    Violation of any applicable laws (including
                                    AML/KYC regulations).
                                </li>
                                <li>Unauthorized use of their account</li>
                                <li>
                                    Any third-party claims resulting from user
                                    actions.
                                </li>
                            </ul>
                        </Point>
                        <Point>
                            Users agree to promptly notify us in writing of any
                            claims or legal actions they are involved in that
                            relate to their use of the Platform.
                        </Point>
                        <Point>
                            We reserve the right, at the user’s expense, to
                            assume exclusive defense and control of any matter
                            subject to indemnification.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>18. TAX RESPONSIBILITIES</TermsTitle>
                    <PointList>
                        <Point>
                            Users are individually responsible for determining
                            and fulfilling any applicable tax obligations
                            related to their use of the Platform, including but
                            not limited to income and capital gains taxes
                        </Point>
                        <Point>
                            We do not provide tax-related advice and encourage
                            users to consult with a qualified tax professional.
                        </Point>
                    </PointList>
                </TermsSection>
                <TermsSection>
                    <TermsTitle>19. TRANSACTION FEES</TermsTitle>
                    <PointList>
                        <Point>
                            We may impose fees on certain transactions,
                            including but not limited to minting, trading, and
                            redemption of FUSD.
                        </Point>
                        <Point>
                            Users will be informed of applicable fees prior to
                            initiating a transaction, and such fees may be
                            subject to modifications at our discretion. Any
                            changes to the fee structure will be communicated to
                            users via the Platform at{' '}
                            <a
                                className="text-blue-600 underline"
                                href="/"
                                target="_blank">
                                TheFedz.org
                            </a>{' '}
                            or via our Telegram channels, at least 7 days before
                            taking effect.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>
                        20. DISPUTE RESOLUTION & GOVERNING LAW
                    </TermsTitle>
                    <TermsText>
                        Any disputes arising from these Terms shall be referred
                        to and finally resolved by the London court of
                        International Arbitration in accordance with the
                        UNCITRAL Arbitration Rules. The seat, or legal place, of
                        arbitration shall be London, England. Arbitration
                        hearings will be held online in accordance with relevant
                        rules. The language to be used in the arbitral
                        proceedings shall be English. The arbitration award
                        shall be final and binding on the Parties (
                        <b>“Binding Arbitration”</b>). The Parties undertake to
                        carry out any award without delay and waive their right
                        to any form of recourse insofar as such waiver can
                        validly be made. Judgment upon the award may be entered
                        by any court having jurisdiction thereof or having
                        jurisdiction over the relevant Party or its assets. Each
                        Party will pay their respective attorneys’ fees and
                        expenses.
                    </TermsText>
                    <PointList>
                        <Point>
                            Users waive their right to participate in any class
                            action lawsuits against us.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>21. GENERAL PROVISIONS</TermsTitle>
                    <PointList>
                        <Point>
                            If any provision of these Terms is found to be
                            invalid or unenforceable, the remaining provisions
                            shall continue in full force and effect.
                        </Point>
                        <Point>
                            The failure to enforce any right or provision of
                            these Terms shall not constitute a waiver of such
                            right or provision by us
                        </Point>
                        <Point>
                            These Terms, along with the Privacy Policy,
                            constitute the entire agreement between the user and
                            us regarding the use of the Platform.
                        </Point>
                    </PointList>
                </TermsSection>

                <TermsSection>
                    <TermsTitle>22. CONTACT INFORMATION</TermsTitle>
                    <TermsText>
                        For inquiries, concerns, or support regarding these
                        Terms, please contact us at TheFedzNFT@gmail.com.
                    </TermsText>
                </TermsSection>

                <footer className="mt-16 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} The Fedz Foundation
                </footer>
            </main>
        </>
    );
}
