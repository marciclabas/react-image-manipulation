import { Button, ButtonGroup, Heading, VStack } from "@chakra-ui/react"
import { RouteObject, useNavigate, useRoutes } from "react-router-dom";
import PerspectiveCropper from './pages/PerspectiveCropper'
import GridSelector from './pages/GridSelector'

const PLAYGROUND_PAGES: Record<string, JSX.Element> = {
  'Grid Selector': <GridSelector />,
  'Perspective Cropper': <PerspectiveCropper />,
}

function Menu() {
  const goto = useNavigate()
  const menu = (
    <VStack h='100vh' w='100vw' align='center' justify='center'>
      <Heading>Image Manipulation UIs</Heading>
      <ButtonGroup isAttached>
        {Object.entries(PLAYGROUND_PAGES).map(([page], i) => (
          <Button p='2rem' key={i} onClick={() => goto(page)}>{page}</Button>
        ))}
      </ButtonGroup>
    </VStack>
  )

  const routes: RouteObject[] = Object.entries(PLAYGROUND_PAGES).map(([page, element]) => ({
    path: page, element
  }))

  return useRoutes([...routes, { path: '*', element: menu }])
}

export default Menu
