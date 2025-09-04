import styles from './PhotoElement.module.css'

type PhotoElementProps = {
    filename: string
}

const PhotoElement:React.FC<PhotoElementProps> = ({filename = 'vite.svg'}) => {
  return (
    <>
    <img src={`${filename}`}></img>
    </>
  )
}

export default PhotoElement