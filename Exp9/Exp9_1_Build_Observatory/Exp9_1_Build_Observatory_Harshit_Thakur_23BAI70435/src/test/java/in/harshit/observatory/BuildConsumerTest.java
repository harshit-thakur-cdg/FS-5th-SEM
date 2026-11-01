package in.harshit.observatory;

import au.com.dius.pact.consumer.MockServer;
import au.com.dius.pact.consumer.dsl.PactDslWithProvider;
import au.com.dius.pact.consumer.junit5.PactConsumerTestExt;
import au.com.dius.pact.consumer.junit5.PactTestFor;
import au.com.dius.pact.core.model.RequestResponsePact;
import au.com.dius.pact.core.model.annotations.Pact;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "BuildObservatoryAPI", pactVersion = au.com.dius.pact.core.model.PactSpecVersion.V3)
class BuildConsumerTest {

    @Pact(consumer = "BuildObservatoryDashboard")
    public RequestResponsePact history(PactDslWithProvider builder) {
        return builder.given("no build records")
                .uponReceiving("a request for build history")
                .path("/api/builds")
                .method("GET")
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("[]")
                .toPact();
    }

    @Test
    @PactTestFor(pactMethod = "history")
    void readsHistory(MockServer server) throws Exception {
        var response = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder(URI.create(server.getUrl() + "/api/builds")).GET().build(),
                HttpResponse.BodyHandlers.ofString()
        );
        assertEquals(200, response.statusCode());
        assertEquals("[]", response.body());
    }
}
