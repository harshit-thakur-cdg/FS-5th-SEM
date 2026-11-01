package in.harshit.canarydock;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "app.demo-enabled=false")
@AutoConfigureMockMvc
class ProductionTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void labDisabled() throws Exception {
        mvc.perform(get("/api/lab"))
                .andExpect(status().isForbidden());

        mvc.perform(post("/api/lab").contentType("application/json").content("{\"action\":\"reset\"}"))
                .andExpect(status().isForbidden());
    }
}
