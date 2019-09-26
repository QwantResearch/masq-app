import React from 'react'
import { storiesOf } from '@storybook/react'

import { OnBoarding } from '../src/components'
import { action } from '@storybook/addon-actions'

OnBoarding.displayName = 'OnBoarding'

const slidesContent = [
  {
    title: 'Comment synchroniser un profil sur cet appareil',
    image: 'image1',
    text: 'Connectez-vous à Masq depuis l\'appareil sur lequel vous possédez déjà un profil'
  },
  {
    title: 'Comment synchroniser un profil sur cet appareil',
    image: 'image2',
    text: 'Dans la rubrique "Appareils », cliquez sur le bouton "Ajouter un appareil"'
  },
  {
    title: 'Comment synchroniser un profil sur cet appareil',
    image: 'image3',
    text: 'Copiez le lien affiché sur votre appareil initial, puis collez-le dans le champs « lien du profil existant » sur cet appareil.'
  }
]

storiesOf('OnBoarding', module)
  .add('1 slide', () => (
    <OnBoarding
      width={337}
      height={480}
      onClose={action('onClosed')}
      slidesContent={[slidesContent[0]]}
    />
  ))
  .add('2 slides', () => (
    <OnBoarding
      width={337}
      height={480}
      onClose={action('onClosed')}
      slidesContent={[slidesContent[0], slidesContent[1]]}
    />
  ))
  .add('3 slides', () => (
    <OnBoarding
      width={337}
      height={480}
      onClose={action('onClosed')}
      slidesContent={slidesContent}
    />
  ))
