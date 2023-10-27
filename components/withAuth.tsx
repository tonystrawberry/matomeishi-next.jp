"use strict";

import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { AuthContext } from "@/contexts/authContext"
import { Loading } from "@/components/loading";

const withAuth = (WrappedComponent: any) => {
  const WithAuthComponent: React.FC = (props: any) => {
    const router = useRouter();

    const { user, loading } = useContext(AuthContext);

    useEffect(() => {
      if (!loading){
        if (!user) {
          // redirect to login page
          router.push("/");
          return;
        }
      }
    }, [loading, user, router]);

    if (loading) {
      return <Loading />;
    } else {
      return <WrappedComponent {...props} />;
    }
  };

  return WithAuthComponent
};


export default withAuth;
