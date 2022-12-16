import React, { useState } from 'react';
import Button from '../components/common/Button';
import HomeSection from '../components/home/HomeSection';
import BlockSendRouter from '../contracts/BlockSendRouter.json'
import Layout from '../components/layouts/Layout';
import { FaChevronDown } from 'react-icons/fa'
import { useRouter } from 'next/router';
import { useContractRead } from 'wagmi';
import { BigNumber } from 'ethers';
import FraudIcon from '../assets/fraud.svg'
import AuditIcon from '../assets/audit.svg'
import RegulatedIcon from '../assets/regulated.svg'
import ProtectionIcon from '../assets/protection.svg'
import SecureIcon from '../assets/secure.svg'

const HOME_SECTIONS = [
  {
    title: "Des frais de transferts plus doux",
    description: "Notre promesse est de permettre à nos clients de payer jusqu’à 3 fois moins cher leurs transferts d’argent à l’étranger.",
    icon: RegulatedIcon
  },
  {
    title: "Régulièrement audité",
    description: "Nous nous assurons que votre argent est en sécurité tout au long du processus de transfert d’argent par des audits de sécurité réguliers.",
    icon: AuditIcon
  },
  {
    title: "Des transactions plus sécurisées",
    description: "Nous nous basons sur la technologie blockhain afin d’assurer la  transparence totale et la sécurité absolue de vos transferts d’argent. ",
    icon: SecureIcon
  },
  {
    title: "Protection des données",
    description: "Nous nous engageons à garder vos données personnelles en sécurité et nous sommes transparents dans la manière dont nous les recueillons, les traitons et les stockons.",
    icon: ProtectionIcon
  },
  {
    title: "Une équipe anti-fraude dédiée",
    description: "Nous travaillons sans relâche pour protéger votre compte et votre argent des fraudes, y compris des plus sophistiquées. Un questionnaire KYC (Know your customer) robuste est nécessaire avant de pouvoir transférer les fonds.",
    icon: FraudIcon
  },
]

const XOF_RATE = 655.957 // fixed rate defined the bank of france

const IndexPage = () => {
  const [value, setValue] = useState(1000)
  const { isLoading, data } = useContractRead({
    address: process.env.NEXT_PUBLIC_BLOCKSEND_ROUTER_ADDRESS,
    abi: BlockSendRouter.abi,
    functionName: 'get_USDC_USD_LatestPrice',
    chainId: parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string),
  })
  const USDCRate = isLoading ? 1 : (data as BigNumber).toNumber() / 100000
  const conversionRate = Math.round((1 - USDCRate) * 10000) / 100
  const conversionPrice = (conversionRate) * value / 100

  const blockSendFees = 1.9
  const otherActorsFees = 6

  const xofValue = Math.ceil(((value) * XOF_RATE * (100 - blockSendFees) / 100))
  const xofValueOtherActors = Math.ceil((value * XOF_RATE * (100 - blockSendFees - otherActorsFees) / 100))
  const router = useRouter()
  const onSend = () => router.push('/login')

  return (
    <Layout heroContent={
      <div className="grid grid-cols-5 gap-6 relative bottom-12">
        <div className="flex col-span-3 pt-20">

          <div className="text-4xl text-white font-bold pr-12" style={{ lineHeight: 1.8 }}>
            <span>

              {"Transférer de l’argent à l’étranger n’a jamais été aussi "}
            </span>

            <span className="underline underline-offset-4">
              {"simple"}
            </span>

            <span>{" et "}</span>
            <span className="underline underline-offset-4">
              {"transparent."}
            </span>
          </div>
        </div>

        <div className="px-6 pt-6 pb-4 bg-gray-200 rounded-xl flex flex-col col-span-2 gap-8 relative right-12">


          <div className="flex flex-col gap-6">

            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-600">
                {"Vous envoyez"}
              </div>

              <div className="flex">
                <input type="number" step={1} value={value} className="flex-grow px-3 py-2" onChange={e => setValue(parseInt(e.target.value))} />
                <div className="h-12 flex items-center justify-center border border-gray-main bg-blue-main text-white px-2 gap-1">
                  <div>
                    {"EUR "}
                  </div>
                  <FaChevronDown />
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-col">

              <div className="flex justify-between">
                <div>{`Frais de service (${blockSendFees}%)`}</div>
                <div>
                  {`${blockSendFees * value / 100} EUR`}
                </div>
              </div>

              {
                USDCRate < 0.995 && (
                  <div className="flex justify-between">
                    <div>{`Frais de conversion (${conversionRate}%)`}</div>
                    <div>
                      {`${conversionPrice} EUR`}
                    </div>
                  </div>
                )
              }

            </div>

            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-600">
                {"Votre destinataire reçoit"}
              </div>

              <div className="flex">
                <input type="number" step={1} value={xofValue} className="flex-grow px-3 py-2 bg-white" disabled />
                <div className="h-12 flex items-center justify-center border border-gray-main bg-blue-main text-white px-2 gap-1">
                  <div>
                    {"XOF "}
                  </div>

                  <FaChevronDown />
                </div>
              </div>

            </div>

            <div className="flex gap-2 flex-col">

              <div className="flex flex-col gap-2">
                <div className="text-sm">{`Économie par rapport aux acteurs traditionnels (~6%) :`}</div>
                <div className="font-semibold">
                  {`${Math.round(xofValue - xofValueOtherActors)} XOF`}
                </div>
              </div>
            </div>

          </div>

          <div className="flex gap-2">
            <Button title="Envoyer maintenant" className="w-full text-center" onClick={onSend} />
            <Button title="Comparer les prix" color='transparent' className="border border-blue-main text-blue-main w-full text-center" />
          </div>

          <div className="text-center opacity-60 flex gap-2 justify-center text-sm">
            <span>
              {'Voir les détails'}
            </span>

            <FaChevronDown className="relative top-1" />
          </div>
        </div>
      </div>
    }>
      <div className="w-full grid grid-cols-2 px-16 gap-16 py-16">
        {
          HOME_SECTIONS.map((section, index) => (
            <HomeSection section={section} key={index} />
          ))
        }
      </div>
    </Layout>
  );
};

export default IndexPage;

