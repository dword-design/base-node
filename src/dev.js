import chokidar from 'chokidar'
import debounce from 'debounce'
import prepublishOnly from './prepublish-only'

export default ({ log = true }) =>
  chokidar.watch('src').on(
    'all',
    debounce(async () => {
      try {
        await prepublishOnly({ log })
      } catch (error) {
        console.log(error.message)
      }
    }, 200)
  )
