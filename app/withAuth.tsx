"use strict";

import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { AuthContext } from "./authContext"

const withAuth = (WrappedComponent: any) => {
  const WithAuthComponent: React.FC = (props: any) => {
    const router = useRouter();

    const { user, loading } = useContext(AuthContext);

    useEffect(() => {
      console.log("withAuth", user, loading)
      if (!loading){
        if (!user) {
          // redirect to login page
          router.push("/");
          return;
        }
      }
    }, [loading, user, router]);

    if (loading) {
      return <div>Loading...</div>;
    } else {
      return <WrappedComponent {...props} />;
    }
  };

  return WithAuthComponent
};


export default withAuth;
