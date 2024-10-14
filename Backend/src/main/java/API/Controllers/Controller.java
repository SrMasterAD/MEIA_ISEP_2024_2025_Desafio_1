package API.Controllers;

import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import API.DTOs.YourRequestModel;

@RestController
@RequestMapping("/api/drools")
public class Controller {

    @Autowired
    private KieContainer kieContainer;

    @PostMapping("/execute")
    public String executeDrools(@RequestBody YourRequestModel request) {
        KieSession kieSession = kieContainer.newKieSession();
        
        // Insert your request data into the session
        kieSession.insert(request);
        
        // Fire all rules
        kieSession.fireAllRules();
        
        // Dispose of the session
        kieSession.dispose();

        return "Rules executed successfully!";
    }
}
