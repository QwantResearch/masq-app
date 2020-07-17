import React from 'react'

import styles from './End.module.scss'

import { ReactComponent as Logo } from '../../assets/logo-colored.svg'
// import { ReactComponent as M } from '../../assets/letter-colored.svg'

const End = () => (
  <div className={styles.End}>
    <aside className={styles.Logo}>
      <Logo />
    </aside>

    <div style={{ maxWidth: 800 }}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Masq by Qwant sera désactivé à partir du XX.</p>
          <p className={styles.paragraph}>À partir de cette date, l’accès à la fonctionnalité Masq ainsi que les lieux enregistrés sur vos appareils connectés à votre Masq ne seront plus accessibles.</p>
        </div>
      </div>

      <div className={styles.content}>
        <p className={styles.paragraphLight}>Masq by Qwant a été rendu public en version alpha afin de vous permettre de tester cette innovation dans le domaine de la personnalisation de services en ligne, avec des données chiffrées et stockées localement chez l'utilisateur.</p>
        <p className={styles.paragraphLight}>
        Après plusieurs mois de tests, Qwant a décidé de suspendre Masq car il ne répond pas en l'état aux attentes de la plupart d'entre vous. La technologie développée par Qwant est partagée sous licence libre sur notre dépôt et peut être réutilisée par quiconque souhaite en profiter ou l'améliorer. Qwant continuera bien-sûr à investir dans des solutions protectrices de la vie privée de ses utilisateurs.
        </p>
      </div>
    </div>
  </div>
)

export default End
