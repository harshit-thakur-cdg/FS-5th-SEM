package in.harshit.observatory;

import au.com.dius.pact.provider.junit5.HttpTestTarget;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.State;
import au.com.dius.pact.provider.junitsupport.loader.PactFolder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Provider("BuildObservatoryAPI")
@PactFolder("target/pacts")
class BuildProviderIT {

    @LocalServerPort
    private int port;

    @Autowired
    private BuildRunRepository repository;

    @BeforeEach
    void target(PactVerificationContext context) {
        context.setTarget(new HttpTestTarget("localhost", port));
    }

    @State("no build records")
    void empty() {
        repository.deleteAll();
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void contract(PactVerificationContext context) {
        context.verifyInteraction();
    }
}
