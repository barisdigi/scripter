using UnityEngine;
using UnityEngine.UI;

public class consoler : MonoBehaviour
{
    public GameObject taster;
    public Text textObj;
    // Start is called before the first frame update
    void Start()
    {
        #if !UNITY_EDITOR && UNITY_WEBGL
            WebGLInput.captureAllKeyboardInput = false;
        #endif
        textObj = taster.GetComponent<Text>();
    }

    // Update is called once per frame
    void Update()
    {
        textObj.text = (int.Parse(textObj.text) + 1).ToString();
    }
}
