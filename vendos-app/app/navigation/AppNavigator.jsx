import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import WelcomeScreen    from '../screens/WelcomeScreen'
import ProductsScreen   from '../screens/ProductsScreen'
import CartScreen       from '../screens/CartScreen'
import PaymentScreen    from '../screens/PaymentScreen'
import DispensingScreen from '../screens/DispensingScreen'

const Stack = createStackNavigator()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0A0A0D' }
        }}
      >
        <Stack.Screen name="Welcome"    component={WelcomeScreen}    />
        <Stack.Screen name="Products"   component={ProductsScreen}   />
        <Stack.Screen name="Cart"       component={CartScreen}       />
        <Stack.Screen name="Payment"    component={PaymentScreen}    />
        <Stack.Screen name="Dispensing" component={DispensingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}