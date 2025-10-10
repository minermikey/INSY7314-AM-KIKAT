// frontend/src/navigation/AppNavigator.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from '../pages/HomePage.jsx';
import PaymentPage from '../pages/PaymentPage.jsx';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Payment" component={PaymentPage} />
    </Stack.Navigator>
  );
}
