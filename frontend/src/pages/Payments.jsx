import React from 'react';

export default function Payments({ user }) {
  return (
    <div>
      <h3>Payments</h3>
      <p>Welcome {user?.firstName ?? user?.username}. You can now create payments (SWIFT flow) from the Payments page.</p>
      <p>(Payment UI will be added next.)</p>
    </div>
  );
}